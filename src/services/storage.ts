import AsyncStorage from '@react-native-async-storage/async-storage';

const memory = new Map<string, string>();
const PREFIX = 'cofrinho:';

let mmkv: {
  getString: (k: string) => string | undefined;
  set: (k: string, v: string) => void;
  delete: (k: string) => void;
  clearAll: () => void;
} | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv');
  mmkv = createMMKV({ id: 'cofrinho' });
} catch {
  mmkv = null;
}

export const storage = {
  getString(key: string): string | null {
    if (mmkv) return mmkv.getString(key) ?? null;
    return memory.get(key) ?? null;
  },
  async hydrate() {
    if (mmkv) return;
    try {
      const keys = await AsyncStorage.getAllKeys();
      const relevant = keys.filter((k) => k.startsWith(PREFIX));
      if (relevant.length === 0) return;
      const pairs = await AsyncStorage.multiGet(relevant);
      pairs.forEach(([k, v]) => {
        if (v) memory.set(k.replace(PREFIX, ''), v);
      });
    } catch {
      // Expo Go / web fallback: keep in-memory only
    }
  },
  set(key: string, value: string) {
    if (mmkv) {
      mmkv.set(key, value);
      return;
    }
    memory.set(key, value);
    void AsyncStorage.setItem(`${PREFIX}${key}`, value).catch(() => undefined);
  },
  delete(key: string) {
    if (mmkv) {
      mmkv.delete(key);
      return;
    }
    memory.delete(key);
    void AsyncStorage.removeItem(`${PREFIX}${key}`).catch(() => undefined);
  },
  clear() {
    if (mmkv) {
      mmkv.clearAll();
      return;
    }
    memory.clear();
    void AsyncStorage.getAllKeys()
      .then((keys) => AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX))))
      .catch(() => undefined);
  },
};
