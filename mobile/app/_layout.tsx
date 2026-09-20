import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { readGuestFlag, setGuestFlag } from '@/lib/guest';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const setUserId = useStore((s) => s.setUserId);
  const userId = useStore((s) => s.userId);
  const guest = useStore((s) => s.guest);
  const setGuest = useStore((s) => s.setGuest);
  const [ready, setReady] = useState(false);

  // Restore guest flag, then listen for login/logout (fires once on mount with current session)
  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;
    readGuestFlag()
      .then(setGuest)
      .finally(() => {
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          const id = session?.user?.id ?? null;
          setUserId(id);
          // A real session supersedes guest mode
          if (id) { setGuest(false); setGuestFlag(false); }
          setReady(true);
          SplashScreen.hideAsync();
        });
        sub = data.subscription;
      });
    return () => sub?.unsubscribe();
  }, []);

  // Navigate based on auth state — only after we know the session
  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    const authed = !!userId || guest;
    if (!authed && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authed && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [ready, userId, guest, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Slot />
    </>
  );
}
