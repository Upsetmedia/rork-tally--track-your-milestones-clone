import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackButton from '../components/BackButton';
import Colors from '../constants/colors';

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[Colors.gradient1, Colors.gradient2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        <BackButton color={Colors.white} style={styles.backButton} testID="onboarding-back" />

        <View style={styles.main}>
          <View style={styles.header}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.logo}>TALLY</Text>
            <Text style={styles.overline}>Track the moment everything changed</Text>
          </View>

          <View style={styles.hero}>
            <Text style={styles.title}>Start Your Journey Today</Text>
            <Text style={styles.subtitle}>What life moment are you tracking?</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-tally')}
            activeOpacity={0.8}
            testID="onboarding-plus"
          >
            <View style={styles.addButtonInner}>
              <Plus size={46} color={Colors.primary} strokeWidth={3} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Tap to begin your first Tally</Text>
          <Text style={styles.footerCaption}>Your journey to a better you starts now</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  main: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  logo: {
    fontSize: 34,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 6,
    marginBottom: 12,
  },
  overline: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500' as const,
    textAlign: 'center',
    opacity: 0.9,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    color: Colors.white,
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: Colors.white,
    opacity: 0.92,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  addButton: {
    marginTop: 48,
    borderRadius: 999,
  },
  addButtonInner: {
    width: 134,
    height: 134,
    borderRadius: 67,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 28,
  },
  footer: {
    alignItems: 'center',
    marginTop: 48,
  },
  footerLabel: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 8,
  },
  footerCaption: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.75,
    textAlign: 'center',
  },
});
