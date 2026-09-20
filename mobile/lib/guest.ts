import AsyncStorage from '@react-native-async-storage/async-storage';

export const GUEST_FLAG_KEY = 'nomnom.guest';

export async function readGuestFlag(): Promise<boolean> {
  try { return (await AsyncStorage.getItem(GUEST_FLAG_KEY)) === '1'; } catch { return false; }
}

export async function setGuestFlag(on: boolean): Promise<void> {
  try {
    if (on) await AsyncStorage.setItem(GUEST_FLAG_KEY, '1');
    else await AsyncStorage.removeItem(GUEST_FLAG_KEY);
  } catch { /* storage unavailable */ }
}
