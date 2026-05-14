import { mockResponse } from './client';
import { mockTeamMembers } from './mock-data';
import type { TeamMember } from './types';

let members = [...mockTeamMembers];
let nextId = members.length + 1;

export async function getTeamMembers() {
  return mockResponse<TeamMember[]>([...members]);
}

export async function createTeamMember(data: Omit<TeamMember, 'id' | 'createdAt' | 'lastLogin'>) {
  const newMember: TeamMember = {
    ...data,
    id: `T${String(nextId++).padStart(3, '0')}`,
    lastLogin: '-',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  members.unshift(newMember);
  return mockResponse(newMember);
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>) {
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return { code: 404, data: null as unknown as TeamMember, message: '未找到' };
  members[index] = { ...members[index], ...data };
  return mockResponse(members[index]);
}

export async function deleteTeamMember(id: string) {
  members = members.filter((m) => m.id !== id);
  return mockResponse(null);
}
