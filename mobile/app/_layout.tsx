import { useEffect, useState } from 'react';
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
  const userId = useStore((s) => s.userId);
  const [ready, setReady] = useState(false);

  // Listen for login/logout — fires once on mount with current session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setReady(true);
      SplashScreen.hideAsync();
    });
    return () => subscription.unsubscribe();
  }, []);

  // Navigate based on auth state — only after we know the session
  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!userId && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (userId && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [ready, userId, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}
