import { User, UserAccount } from '../types/auth';
import { syncToServer, loginDirectToServer, wipeServer } from './api';

const USERS_STORAGE_KEY = 'netipam_users_list_v1';

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Web Crypto API failed, fallback to raw password (backend akan melakukan hashing).');
    }
  } else {
    console.warn('Web Crypto API tidak tersedia, fallback to raw password (backend akan melakukan hashing).');
  }
  return password;
}

export async function createUser(
  currentUsers: UserAccount[], 
  userData: { 
    username: string; 
    name: string; 
    email: string; 
    password: string; 
    role?: string; 
    avatar?: string;
    appName?: string;
    appLogo?: string;
  }
): Promise<{ success: boolean; error?: string; user?: UserAccount; updatedUsers?: UserAccount[] }> {
  if (currentUsers.length >= 1) {
    return { success: false, error: 'Sistem hanya memerlukan 1 pengguna saja. Silakan perbarui akun yang sudah ada.' };
  }

  const normalizedUsername = userData.username.trim().toLowerCase();

  if (!normalizedUsername) {
    return { success: false, error: 'Username wajib diisi!' };
  }
  if (!userData.password || userData.password.length < 4) {
    return { success: false, error: 'Password minimal 4 karakter!' };
  }
  if (!userData.name.trim()) {
    return { success: false, error: 'Nama lengkap wajib diisi!' };
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    username: normalizedUsername,
    name: userData.name.trim(),
    email: userData.email.trim(),
    password: await hashPassword(userData.password),
    avatar: userData.avatar || undefined,
    appName: userData.appName?.trim() || undefined,
    appLogo: userData.appLogo?.trim() || undefined,
    createdAt: new Date().toISOString()
  };

  const updatedUsers = [newUser];
  await syncToServer(USERS_STORAGE_KEY, updatedUsers);

  return { success: true, user: newUser, updatedUsers };
}

export async function updateUser(
  currentUsers: UserAccount[],
  id: string, 
  updates: Partial<Omit<UserAccount, 'id'>>
): Promise<{ success: boolean; error?: string; user?: UserAccount; updatedUsers?: UserAccount[] }> {
  const index = currentUsers.findIndex(u => u.id === id);
  if (index === -1) {
    return { success: false, error: 'Pengguna tidak ditemukan di database!' };
  }

  if (updates.username) {
    const normalizedUsername = updates.username.trim().toLowerCase();
    const exists = currentUsers.some(u => u.id !== id && u.username.toLowerCase() === normalizedUsername);
    if (exists) {
      return { success: false, error: `Username "${updates.username}" sudah digunakan!` };
    }
    updates.username = normalizedUsername;
  }

  const current = currentUsers[index];
  const updatedUser: UserAccount = {
    ...current,
    ...updates,
    password: updates.password && updates.password.trim() ? await hashPassword(updates.password) : current.password
  };

  const updatedUsers = [...currentUsers];
  updatedUsers[index] = updatedUser;
  await syncToServer(USERS_STORAGE_KEY, updatedUsers);

  return { success: true, user: updatedUser, updatedUsers };
}

export async function deleteUser(
  currentUsers: UserAccount[], 
  id: string
): Promise<{ success: boolean; error?: string; updatedUsers?: UserAccount[] }> {
  const target = currentUsers.find(u => u.id === id);
  if (!target) {
    return { success: false, error: 'Pengguna tidak ditemukan di database!' };
  }

  const updatedUsers = currentUsers.filter(u => u.id !== id);
  await syncToServer(USERS_STORAGE_KEY, updatedUsers);

  return { success: true, updatedUsers };
}

export function getCurrentUser(): User | null {
  try {
    const raw = sessionStorage.getItem('netipam_session');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setCurrentUserSession(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem('netipam_session', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('netipam_session');
    }
  } catch (e) {}
}

export function logoutUser(): void {
  try {
    sessionStorage.removeItem('netipam_session');
  } catch (e) {}
}

export function loadUsers(): UserAccount[] {
  return [];
}

export async function saveUsers(users: UserAccount[]): Promise<void> {
  await syncToServer(USERS_STORAGE_KEY, users);
}

export async function loginUser(
  username: string, 
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  return await loginDirectToServer(username, password);
}

export async function wipeAllUsers(): Promise<void> {
  logoutUser();
  await wipeServer();
}
