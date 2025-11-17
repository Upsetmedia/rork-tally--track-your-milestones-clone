import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTallies } from '@/contexts/tallies';
import { useAuth } from '@/contexts/auth';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { tallies, isLoading: talliesLoading } = useTallies();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !talliesLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (tallies.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  }, [isAuthenticated, tallies, authLoading, talliesLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
