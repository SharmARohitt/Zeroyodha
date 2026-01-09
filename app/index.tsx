import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for native modules before checking auth
    const init = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        await checkAuth();
        setIsReady(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsReady(true); // Continue anyway
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isReady && !isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)/watchlist');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isReady, isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2962FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
});

