import { mockResponse } from './client';
import { mockCreativeAssets } from './mock-data';
import type { CreativeAsset } from './types';

let assets = [...mockCreativeAssets];

export async function getCreativeAssets() {
  return mockResponse<CreativeAsset[]>([...assets]);
}

export async function deleteCreativeAsset(id: string) {
  assets = assets.filter((a) => a.id !== id);
  return mockResponse(null);
}
