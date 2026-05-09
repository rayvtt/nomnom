import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const setUserId = useStore((s) => s.setUserId);

  useEffect(() => {
    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      const inAuthGroup = segments[0] === '(auth)';

      if (!uid && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (uid && inAuthGroup) {
        router.replace('/(tabs)');
      }

      SplashScreen.hideAsync();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}
