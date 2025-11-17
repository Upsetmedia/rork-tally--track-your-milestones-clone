import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Hammer, Waves, Sun, ArrowRight, PenSquare } from 'lucide-react-native';
import BackButton from '../components/BackButton';
import Colors from '../constants/colors';

interface ToolboxOption {
  id: 'daily-check-in' | 'journal' | 'meditation-tips';
  title: string;
  description: string;
  accent: string;
  icon: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
  destination?: string;
}

const TOOLBOX_OPTIONS: ToolboxOption[] = [
  {
    id: 'daily-check-in',
    title: 'Daily Check-In',
    description: 'Log where you are today with a quick mood snapshot.',
    accent: '#FACC15',
    icon: Sun,
    destination: '/(tabs)/tools?focus=daily',
  },
  {
    id: 'journal',
    title: 'Journal',
    description: 'Capture reflections and wins with guided prompts.',
    accent: '#6366F1',
    icon: PenSquare,
    destination: '/(tabs)/tools?focus=journal',
  },
  {
    id: 'meditation-tips',
    title: 'Meditation Tips & Tricks',
    description: 'Explore breathing rituals and mindful resets anytime.',
    accent: '#7C3AED',
    icon: Waves,
    destination: '/(tabs)/meditation',
  },
];

export default function ToolboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = useCallback(() => {
    console.log('Toolbox: back pressed');
    router.back();
  }, [router]);

  const handleOptionPress = useCallback(
    (option: ToolboxOption) => {
      console.log('Toolbox: option pressed', option.id);
      if (option.destination) {
        router.push(option.destination);
        return;
      }

      if (Platform.OS === 'web') {
        window.alert('Coming soon to the toolbox!');
      } else {
        console.log('Toolbox: destination pending');
      }
    },
    [router],
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBackground}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.headerRow}>
            <BackButton
              color={Colors.white}
              style={styles.backButton}
              testID="toolbox-back-button"
              onPress={handleBack}
            />
            <View style={styles.headerTitles}>
              <View style={styles.titleRow}>
                <Hammer size={24} color={Colors.white} />
                <Text style={styles.headerTitle}>ToolBox</Text>
              </View>
              <Text style={styles.headerSubtitle}>Always-on support for your sobriety journey</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 48 }]}
      >
        <View style={styles.sectionHeading} testID="toolbox-section-heading">
          <Text style={styles.sectionHeadingTitle}>Choose a tool</Text>
          <Text style={styles.sectionHeadingSubtitle}>
            Jump into the practice you need right now. Each tile opens a focused flow.
          </Text>
        </View>

        {TOOLBOX_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <TouchableOpacity
              key={option.id}
              testID={`toolbox-option-${option.id}`}
              style={styles.optionCard}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.optionIconWrapper, { backgroundColor: option.accent }]}
                testID={`toolbox-option-icon-${option.id}`}
              >
                <Icon size={22} color={Colors.white} />
              </View>
              <View style={styles.optionTextBlock}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <View style={styles.optionChevron}>
                <ArrowRight size={20} color="rgba(79,70,229,0.7)" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroBackground: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  safeArea: {
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 20,
  },
  sectionHeading: {
    gap: 10,
  },
  sectionHeadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  sectionHeadingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  optionCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.12)',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  optionIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  optionTextBlock: {
    flex: 1,
    gap: 6,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.2,
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  optionChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,70,229,0.08)',
  },
});
