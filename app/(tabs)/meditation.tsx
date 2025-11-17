import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  LucideIcon,
  Wind,
  Moon,
  Sparkles,
  Feather,
  Heart,
  Timer,
  Waves,
  Music2,
} from 'lucide-react-native';
import Colors from '../../constants/colors';

interface FocusArea {
  key: 'calm' | 'sleep' | 'energy';
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  highlight: string;
}

interface MeditationTip {
  id: string;
  focus: FocusArea['key'];
  title: string;
  subTitle: string;
  icon: LucideIcon;
  bulletPoints: string[];
  durationLabel: string;
}

interface MicroPractice {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  duration: string;
}

const focusAreas: FocusArea[] = [
  {
    key: 'calm',
    label: 'Settle the Mind',
    description: 'Gentle breathing rituals to soothe the nervous system.',
    icon: Wind,
    accent: '#60A5FA',
    highlight: 'Try these when you feel anxious or scattered.',
  },
  {
    key: 'sleep',
    label: 'Deep Rest',
    description: 'Ease into restorative sleep with soft, grounding practices.',
    icon: Moon,
    accent: '#818CF8',
    highlight: 'Use these within an hour of bedtime for best results.',
  },
  {
    key: 'energy',
    label: 'Spark Focus',
    description: 'Brighten your mood and ignite steady focus fast.',
    icon: Sparkles,
    accent: '#F59E0B',
    highlight: 'Perfect for a mid-day reset or pre-work session.',
  },
];

const meditationTips: MeditationTip[] = [
  {
    id: 'box-breathing',
    focus: 'calm',
    title: 'Box Breathing Reset',
    subTitle: 'Regulate your breath and bring the body back to equilibrium.',
    icon: Wind,
    bulletPoints: [
      'Inhale through the nose for a steady count of four.',
      'Hold the breath gently for four counts—keep shoulders relaxed.',
      'Exhale slowly through the mouth for four counts, loosening the jaw.',
      'Pause empty for four counts before the next inhale.',
    ],
    durationLabel: '4 minutes',
  },
  {
    id: 'weighted-exhale',
    focus: 'calm',
    title: 'Weighted Exhale Technique',
    subTitle: 'Lengthen the exhale to tell your nervous system it is safe.',
    icon: Feather,
    bulletPoints: [
      'Sit tall, relax shoulders, and count the inhale to four.',
      'Exhale for six to eight counts, imagining stress leaving the body.',
      'Rest for two counts before the next breath to absorb the calm.',
    ],
    durationLabel: '3 minutes',
  },
  {
    id: 'moonlit-body-scan',
    focus: 'sleep',
    title: 'Moonlit Body Scan',
    subTitle: 'Release hidden tension by melting through each body region.',
    icon: Moon,
    bulletPoints: [
      'Lie down and breathe slowly into the belly for five rounds.',
      'Travel attention from toes to crown, inviting each muscle to soften.',
      'When the mind wanders, note “thinking” and float back to the breath.',
    ],
    durationLabel: '8 minutes',
  },
  {
    id: 'evening-gratitude',
    focus: 'sleep',
    title: 'Evening Gratitude Drift',
    subTitle: 'Replace racing thoughts with three gentle gratitude prompts.',
    icon: Heart,
    bulletPoints: [
      'Recall one moment you’re grateful for and feel it in the heart space.',
      'Name one person you appreciate, whispering “thank you” silently.',
      'Visualize tomorrow unfolding with calm confidence and ease.',
    ],
    durationLabel: '6 minutes',
  },
  {
    id: 'sunrise-stacks',
    focus: 'energy',
    title: 'Sunrise Breath Stacks',
    subTitle: 'Layered breathing to brighten the mind without jitters.',
    icon: Sparkles,
    bulletPoints: [
      'Inhale for four counts, hold two, exhale for four, hold two (4-2-4-2).',
      'On every third breath, add a gentle shoulder roll to open the chest.',
      'Finish with three quick “sip breaths” in through the nose, one long exhale.',
    ],
    durationLabel: '5 minutes',
  },
  {
    id: 'flow-walk',
    focus: 'energy',
    title: 'Flow State Walking',
    subTitle: 'Move meditation that reboots focus in under ten minutes.',
    icon: Waves,
    bulletPoints: [
      'Walk at a natural pace, matching breath to your steps (inhale 3, exhale 3).',
      'Notice five colors around you and label them silently.',
      'Set a single-word intention ("steady", "clear") and repeat on each exhale.',
    ],
    durationLabel: '8 minutes',
  },
];

const microPractices: MicroPractice[] = [
  {
    id: 'sound-bath',
    title: '30-Second Sound Bath',
    description: 'Close your eyes and name three layers of sound—from farthest to closest.',
    icon: Music2,
    duration: '0:30',
  },
  {
    id: 'pulse-check',
    title: 'Pulse Check Pause',
    description: 'Rest fingertips on your pulse. Count five beats while breathing slow and deep.',
    icon: Heart,
    duration: '0:45',
  },
  {
    id: 'micro-journal',
    title: 'Micro Journal Prompt',
    description: 'Write one sentence: “Right now I feel…”. Let it be raw and unfiltered.',
    icon: Feather,
    duration: '1:00',
  },
  {
    id: 'focus-timer',
    title: 'Three Breath Reset',
    description: 'Three expansive inhales, each exhale twice as long. Stack whenever stress spikes.',
    icon: Timer,
    duration: '0:40',
  },
];

export default function MeditationScreen() {
  const insets = useSafeAreaInsets();
  const [selectedFocus, setSelectedFocus] = useState<FocusArea['key']>('calm');

  const activeFocusArea = useMemo(() => {
    return focusAreas.find((area) => area.key === selectedFocus) ?? focusAreas[0];
  }, [selectedFocus]);

  const filteredTips = useMemo(() => {
    return meditationTips.filter((tip) => tip.focus === selectedFocus);
  }, [selectedFocus]);

  return (
    <View style={styles.container} testID="meditation-screen">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.gradient1, Colors.gradient2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 28 }]}
        >
          <Text style={styles.heroEyebrow}>Meditation Studio</Text>
          <Text style={styles.heroTitle}>Tips & Tricks that meet you where you are</Text>
          <Text style={styles.heroSubtitle}>
            Choose a focus to unlock curated practices, breathing drills, and mindful resets.
          </Text>
        </LinearGradient>

        <View style={styles.contentWrapper}>
          <View style={styles.focusSelector}>
            {focusAreas.map((area) => {
              const Icon = area.icon;
              const isActive = area.key === selectedFocus;
              return (
                <TouchableOpacity
                  key={area.key}
                  onPress={() => setSelectedFocus(area.key)}
                  activeOpacity={0.8}
                  style={[styles.focusCard, isActive && { borderColor: area.accent, backgroundColor: '#FFFFFF' }]}
                  testID={`focus-option-${area.key}`}
                >
                  <View style={[styles.focusIconWrapper, { backgroundColor: `${area.accent}1A` }]}
                  >
                    <Icon size={22} color={area.accent} />
                  </View>
                  <Text style={styles.focusLabel}>{area.label}</Text>
                  <Text style={styles.focusDescription}>{area.description}</Text>
                  {isActive && (
                    <View style={[styles.focusHighlight, { backgroundColor: `${area.accent}14` }]}
                      testID="focus-highlight"
                    >
                      <Text style={[styles.focusHighlightText, { color: area.accent }]}>
                        {area.highlight}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeFocusArea.label}</Text>
            <Text style={[styles.sectionSubTitle, { color: activeFocusArea.accent }]}>
              {activeFocusArea.highlight}
            </Text>
          </View>

          <View style={styles.tipList} testID="meditation-tip-list">
            {filteredTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <View key={tip.id} style={styles.tipCard} testID={`meditation-tip-${tip.id}`}>
                  <View style={styles.tipHeader}>
                    <View style={styles.tipIconCircle}
                    >
                      <Icon size={22} color={activeFocusArea.accent} />
                    </View>
                    <View style={styles.tipHeaderText}>
                      <Text style={styles.tipTitle}>{tip.title}</Text>
                      <Text style={styles.tipSubtitle}>{tip.subTitle}</Text>
                    </View>
                    <View style={styles.durationPill}>
                      <Timer size={16} color={Colors.white} />
                      <Text style={styles.durationText}>{tip.durationLabel}</Text>
                    </View>
                  </View>
                  <View style={styles.tipBody}>
                    {tip.bulletPoints.map((bullet, index) => (
                      <View key={`${tip.id}-bullet-${index}`} style={styles.tipBulletRow}>
                        <View style={[styles.tipBulletDot, { backgroundColor: activeFocusArea.accent }]} />
                        <Text style={styles.tipBulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Micro Practices</Text>
            <Text style={styles.sectionSubTitle}>Snackable resets you can layer throughout the day.</Text>
          </View>

          <View style={styles.microGrid} testID="micro-practice-grid">
            {microPractices.map((practice) => {
              const Icon = practice.icon;
              return (
                <View key={practice.id} style={styles.microCard} testID={`micro-practice-${practice.id}`}>
                  <View style={styles.microHeader}>
                    <View style={styles.microIconWrapper}>
                      <Icon size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.microTimerPill}>
                      <Timer size={14} color={Colors.white} />
                      <Text style={styles.microTimerText}>{practice.duration}</Text>
                    </View>
                  </View>
                  <Text style={styles.microTitle}>{practice.title}</Text>
                  <Text style={styles.microDescription}>{practice.description}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scroll: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    gap: 12,
  },
  heroEyebrow: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.84)',
    lineHeight: 22,
  },
  contentWrapper: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 28,
  },
  focusSelector: {
    gap: 16,
  },
  focusCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0)',
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    gap: 12,
  },
  focusIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  focusDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  focusHighlight: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  focusHighlightText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  sectionSubTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tipList: {
    gap: 18,
  },
  tipCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#111827',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    gap: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  tipIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  tipHeaderText: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  tipSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.3,
  },
  tipBody: {
    gap: 12,
  },
  tipBulletRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipBulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  tipBulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
  },
  microGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  microCard: {
    flexBasis: '47%',
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#111827',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  microHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  microIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99,102,241,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  microTimerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  microTimerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },
  microTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  microDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
