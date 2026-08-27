/**
 * Camada de armazenamento offline-first com AsyncStorage.
 * Prefixo 'smartalarm:' para evitar colisões.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@smartalarm:';

function key(k: string): string {
  return `${PREFIX}${k}`;
}

export const storage = {
  async get<T>(k: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key(k));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  async set<T>(k: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key(k), JSON.stringify(value));
    } catch {
      // falha silenciosa em storage cheio
    }
  },

  async remove(k: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key(k));
    } catch {
      // ignora
    }
  },

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixed = keys.filter((k) => k.startsWith(PREFIX));
      await AsyncStorage.multiRemove(prefixed);
    } catch {
      // ignora
    }
  },

  // Chaves específicas da aplicação
  keys: {
    alarms: 'alarms',
    lastSync: 'lastSync',
    settings: 'settings',
    pendingMutations: 'pendingMutations',
  },
};

export async function getCachedAlarms(): Promise<any[]> {
  return storage.get(storage.keys.alarms, []);
}

export async function setCachedAlarms(alarms: any[]): Promise<void> {
  await storage.set(storage.keys.alarms, alarms);
}

export async function getLastSync(): Promise<number | null> {
  return storage.get(storage.keys.lastSync, null);
}

export async function setLastSync(timestamp: number): Promise<void> {
  await storage.set(storage.keys.lastSync, timestamp);
}

export interface PendingMutation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'snooze' | 'dismiss';
  payload: unknown;
  timestamp: number;
  retries: number;
}

export async function getPendingMutations(): Promise<PendingMutation[]> {
  return storage.get(storage.keys.pendingMutations, []);
}

export async function addPendingMutation(mutation: Omit<PendingMutation, 'id' | 'timestamp' | 'retries'>): Promise<void> {
  const list = await getPendingMutations();
  list.push({
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  });
  await storage.set(storage.keys.pendingMutations, list);
}

export async function removePendingMutation(id: string): Promise<void> {
  const list = await getPendingMutations();
  const filtered = list.filter((m) => m.id !== id);
  await storage.set(storage.keys.pendingMutations, filtered);
}

export async function incrementMutationRetries(id: string): Promise<void> {
  const list = await getPendingMutations();
  const idx = list.findIndex((m) => m.id === id);
  if (idx >= 0) {
    list[idx].retries += 1;
    await storage.set(storage.keys.pendingMutations, list);
  }
}

export async function clearPendingMutations(): Promise<void> {
  await storage.remove(storage.keys.pendingMutations);
}