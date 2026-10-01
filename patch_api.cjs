const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');
code = code.replace(/let syncQueue: Promise<void> = Promise.resolve\(\);/, `let syncQueue: Promise<void> = Promise.resolve();
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
`);
code = code.replace(/export async function syncToServer\(key: string, data: any\) {/, `export async function syncToServer(key: string, data: any) {
  syncTotal++;`);
code = code.replace(/    } catch \(error\) {/g, `    } catch (error) {`);
code = code.replace(/      console.error\\\(\\\`Failed to sync \\\$\\{key\\} to server:\\\`, error\\\);\\n    }\\n  }\\);/g, `      console.error(\`Failed to sync \${key} to server:\`, error);
    }
    syncCompleted++;
    if (onSyncProgress) onSyncProgress(syncCompleted, syncTotal);
  });`);

fs.writeFileSync('src/utils/api.ts', code);
