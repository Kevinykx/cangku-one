import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Upload, FileImage, FileVideo, Check, Loader2 } from 'lucide-react';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  type: 'image' | 'video';
  format: string;
  fileSize: number;
  dimensions: string;
  previewUrl: string;
  uploadTime: string;
}

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileItem[]) => Promise<void>;
}

export function BatchUploadModal({ isOpen, onClose, onUpload }: BatchUploadModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setUploading(false);
      setUploadDone(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      files.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  const formatTime = () => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const formatFileSize = (bytes: number) => parseFloat((bytes / (1024 * 1024)).toFixed(1));

  const loadDimensions = useCallback((type: 'image' | 'video', url: string): Promise<string> => {
    return new Promise((resolve) => {
      if (type === 'image') {
        const img = new Image();
        img.onload = () => resolve(`${img.naturalWidth}×${img.naturalHeight}`);
        img.onerror = () => resolve('-');
        img.src = url;
      } else {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => resolve(`${video.videoWidth}×${video.videoHeight}`);
        video.onerror = () => resolve('-');
        video.src = url;
      }
    });
  }, []);

  const processFiles = async (selectedFiles: FileList) => {
    const newItems: FileItem[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const isVideo = file.type.startsWith('video/');
      if (!file.type.startsWith('image/') && !isVideo) continue;
      const id = `upload-${Date.now()}-${i}`;
      const previewUrl = URL.createObjectURL(file);
      const dimensions = await loadDimensions(isVideo ? 'video' : 'image', previewUrl);
      newItems.push({
        id,
        file,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        format: file.name.split('.').pop() || '',
        fileSize: formatFileSize(file.size),
        dimensions,
        previewUrl,
        uploadTime: formatTime(),
      });
    }
    setFiles(prev => [...prev, ...newItems]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const item = prev.find(f => f.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      await onUpload(files);
      setUploadDone(true);
      setTimeout(onClose, 1500);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">批量上传素材</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {files.length === 0 ? (
            <div
              ref={dropRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg py-20 text-center hover:border-blue-400 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-1">点击或拖拽文件到此区域上传</p>
              <p className="text-gray-400 text-sm">支持图片和视频文件，可批量选择</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">已选择 <span className="font-medium">{files.length}</span> 个文件</p>
                <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 hover:text-blue-800">
                  继续添加
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden group relative bg-white">
                    <div className="aspect-[4/3] bg-gray-100 relative">
                      {item.type === 'image' ? (
                        <img src={item.previewUrl} alt={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <video src={item.previewUrl} className="w-full h-full object-contain" />
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-black/50 text-white">
                          {item.type === 'image' ? <FileImage className="w-3 h-3 mr-1" /> : <FileVideo className="w-3 h-3 mr-1" />}
                          {item.format.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(item.id)}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/70"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {uploadDone && (
                        <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center rounded-lg">
                          <Check className="w-10 h-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex flex-wrap gap-x-2 text-xs text-gray-500">
                        {item.dimensions !== '-' && <span>{item.dimensions}</span>}
                        <span>{item.fileSize}MB</span>
                      </div>
                      <p className="text-xs text-gray-400">{item.uploadTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl shrink-0">
          <p className="text-sm text-gray-500">
            {files.length > 0
              ? `共 ${files.length} 个文件，总计 ${files.reduce((s, f) => s + f.fileSize, 0).toFixed(1)} MB`
              : '支持 JPG、PNG、GIF、WebP、MP4、MOV、AVI 等格式'}
          </p>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-200 transition-colors">
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />上传中...</>
              ) : uploadDone ? (
                <><Check className="w-4 h-4 mr-2" />上传完成</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" />开始上传</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
