import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import "../global.css";
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

import { useColorScheme } from '@/components/useColorScheme';
import { FloatingButtons } from '@/components/FloatingButtons';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing || !loaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth group
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to main app if authenticated and in auth group
      router.replace('/(tabs)');
    }
  }, [user, initializing, segments, loaded]);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && !initializing) {
      SplashScreen.hideAsync();
    }
  }, [loaded, initializing]);

  if (!loaded || initializing) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <FloatingButtons />
    </ThemeProvider>
  );
}
