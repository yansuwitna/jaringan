let syncQueue: Promise<void> = Promise.resolve();
export let syncTotal = 0;
export let syncCompleted = 0;
export let onSyncProgress: ((completed: number, total: number) => void) | null = null;

export function setSyncProgressListener(callback: ((c: number, t: number) => void) | null) {
  onSyncProgress = callback;
  if (!callback) {
    syncTotal = 0;
    syncCompleted = 0;
  }
}

export async function syncToServer(key: string, data: any) {
  syncTotal++;
  syncQueue = syncQueue.then(async () => {
    try {
      await fetch(`/api/penyimpanan/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Failed to sync ${key} to server:`, error);
    }
    syncCompleted++;
    if (onSyncProgress) onSyncProgress(syncCompleted, syncTotal);
  });
  return syncQueue;
}

export async function loginDirectToServer(username: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch('/api/autentikasi/masuk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to login via server:', error);
    return { success: false, error: 'Tidak dapat menghubungi server database.' };
  }
}

export async function loginWithTokenDirectToServer(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch('/api/autentikasi/masuk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });
    return await res.json();
  } catch (error) {
    console.error('Failed to login with token via server:', error);
    return { success: false, error: 'Tidak dapat menghubungi server database.' };
  }
}

export async function fetchFromServer() {
  try {
    const res = await fetch('/api/penyimpanan/semua');
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error(`Failed to fetch from server:`, error);
  }
  return null;
}

export async function wipeServer() {
  try {
    await fetch('/api/penyimpanan/semua', {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Failed to wipe server:', error);
  }
}

export function awaitSyncQueue() {
  return syncQueue;
}
