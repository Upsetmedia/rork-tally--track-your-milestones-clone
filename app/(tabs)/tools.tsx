import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { History, PenLine, Sun, Waves } from 'lucide-react-native';
import Colors from '../../constants/colors';

import { useJournal } from '../../contexts/journal';

const MOOD_SCALE = [
  { value: 1, emoji: '😩', label: 'Terrible' },
  { value: 2, emoji: '😢', label: 'Very Bad' },
  { value: 3, emoji: '😔', label: 'Bad' },
  { value: 4, emoji: '😕', label: 'Not Great' },
  { value: 5, emoji: '😐', label: 'Okay' },
  { value: 6, emoji: '🙂', label: 'Alright' },
  { value: 7, emoji: '😌', label: 'Good' },
  { value: 8, emoji: '😄', label: 'Great' },
  { value: 9, emoji: '🤩', label: 'Amazing' },
  { value: 10, emoji: '🧘', label: 'Peaceful' },
];

export default function ToolsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { addEntry, getTodayEntry } = useJournal();

  const scrollRef = useRef<ScrollView | null>(null);
  const dailyCardOffset = useRef<number | null>(null);
  const journalCardOffset = useRef<number | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<'daily' | 'journal' | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalText, setJournalText] = useState<string>('');
  const [hasEntryToday, setHasEntryToday] = useState<boolean>(false);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date());
    } catch (error) {
      console.error('[ToolsScreen] Failed to format date', error);
      return '';
    }
  }, []);

  useEffect(() => {
    const todayEntry = getTodayEntry();
    if (todayEntry) {
      console.log('[ToolsScreen] Hydrating state from saved entry', todayEntry);
      setHasEntryToday(true);
      setSelectedMood(todayEntry.mood);
      setJournalText(todayEntry.entry ?? '');
    }
  }, [getTodayEntry]);

  const focusParam = useMemo(() => {
    const rawFocus = params.focus;
    if (Array.isArray(rawFocus)) {
      return rawFocus[0];
    }
    return typeof rawFocus === 'string' ? rawFocus : undefined;
  }, [params.focus]);

  const handleFocusScroll = useCallback(
    (target: 'daily' | 'journal', offset: number | null) => {
      if (!focusParam || focusParam !== target || offset === null) {
        return;
      }

      scrollRef.current?.scrollTo({ y: Math.max(offset - 24, 0), animated: true });
      setHighlightedCard(target);
    },
    [focusParam],
  );

  useEffect(() => {
    if (!highlightedCard) {
      return;
    }

    const timeout = setTimeout(() => {
      setHighlightedCard(null);
    }, 1800);

    return () => {
      clearTimeout(timeout);
    };
  }, [highlightedCard]);

  const handleSaveDailyCheckIn = useCallback(async () => {
    if (selectedMood === null) {
      Alert.alert('Select your mood', "Please rate how you're feeling today (1-10)");
      return;
    }

    try {
      console.log('[ToolsScreen] Saving daily check-in', {
        mood: selectedMood,
        hasJournalText: journalText.trim().length > 0,
      });
      await addEntry({
        mood: selectedMood,
        entry: journalText.trim() || undefined,
      });

      setHasEntryToday(true);
      Alert.alert('Daily check-in saved', 'Mood recorded for today.');
    } catch (error) {
      console.error('[ToolsScreen] Failed to save daily check-in', error);
      Alert.alert('Error', 'Unable to save your check-in. Please try again.');
    }
  }, [addEntry, journalText, selectedMood]);

  const handleSaveJournalEntry = useCallback(async () => {
    if (selectedMood === null) {
      Alert.alert('Complete your check-in', 'Log your mood in the Daily Check-In card first.');
      return;
    }

    try {
      console.log('[ToolsScreen] Saving journal entry', {
        mood: selectedMood,
        characters: journalText.trim().length,
      });
      await addEntry({
        mood: selectedMood,
        entry: journalText.trim() || undefined,
      });

      setHasEntryToday(true);
      Alert.alert('Journal updated', 'Your reflection has been saved.');
    } catch (error) {
      console.error('[ToolsScreen] Failed to save journal entry', error);
      Alert.alert('Error', 'Unable to save your journal entry. Please try again.');
    }
  }, [addEntry, journalText, selectedMood]);

  const handleNewEntry = useCallback(() => {
    console.log('[ToolsScreen] Resetting daily entry state');
    setSelectedMood(null);
    setJournalText('');
    setHasEntryToday(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]} testID="toolbox-header">
        <Text style={styles.headerTitle}>Toolbox</Text>
        <Text style={styles.headerSubtitle}>Build your daily rhythm</Text>
        {!!formattedDate && <Text style={styles.headerDate}>{formattedDate}</Text>}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {hasEntryToday && (
          <View style={styles.completedBanner} testID="daily-check-in-banner">
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Logged</Text>
            </View>
            <View style={styles.completedTextContainer}>
              <Text style={styles.completedTitle}>Daily check-in saved</Text>
              <Text style={styles.completedSubtitle}>Update anytime to keep your streak reflective</Text>
            </View>
            <TouchableOpacity
              style={styles.newEntryButton}
              onPress={handleNewEntry}
              activeOpacity={0.7}
              testID="reset-daily-entry-button"
            >
              <Text style={styles.newEntryButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[styles.toolCard, highlightedCard === 'daily' ? styles.highlightedCard : null]}
          onLayout={(event) => {
            dailyCardOffset.current = event.nativeEvent.layout.y;
            handleFocusScroll('daily', dailyCardOffset.current);
          }}
          testID="daily-check-in-card"
        >
          <View style={styles.toolCardHeader}>
            <View style={styles.toolIconBubble}>
              <Sun size={22} color={Colors.primary} />
            </View>
            <View style={styles.toolTitles}>
              <Text style={styles.toolTitle}>Daily Check-In</Text>
              <Text style={styles.toolSubtitle}>Rate how you feel right now</Text>
            </View>
          </View>
          <View style={styles.toolDivider} />
          <Text style={styles.sectionDescription}>Tap the mood that best captures your day.</Text>
          <View style={styles.moodScale}>
            {MOOD_SCALE.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  selectedMood === mood.value && styles.moodButtonSelected,
                ]}
                onPress={() => setSelectedMood(mood.value)}
                activeOpacity={0.8}
                testID={`mood-option-${mood.value}`}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodNumber,
                    selectedMood === mood.value && styles.moodNumberSelected,
                  ]}
                >
                  {mood.value}
                </Text>
                <Text
                  style={[
                    styles.moodLabel,
                    selectedMood === mood.value && styles.moodLabelSelected,
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              selectedMood === null && styles.primaryButtonDisabled,
            ]}
            onPress={handleSaveDailyCheckIn}
            activeOpacity={0.85}
            disabled={selectedMood === null}
            testID="save-daily-checkin-button"
          >
            <Text style={styles.primaryButtonText}>Save daily check-in</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.toolCard, highlightedCard === 'journal' ? styles.highlightedCard : null]}
          onLayout={(event) => {
            journalCardOffset.current = event.nativeEvent.layout.y;
            handleFocusScroll('journal', journalCardOffset.current);
          }}
          testID="journal-card"
        >
          <View style={styles.toolCardHeader}>
            <View style={styles.toolIconBubble}>
              <PenLine size={22} color={Colors.secondary} />
            </View>
            <View style={styles.toolTitles}>
              <Text style={styles.toolTitle}>Journaling</Text>
              <Text style={styles.toolSubtitle}>Capture thoughts that shaped your day</Text>
            </View>
          </View>
          <View style={styles.toolDivider} />
          <Text style={styles.inputLabel}>Add a quick note (optional)</Text>
          <TextInput
            style={styles.journalInput}
            multiline
            placeholder={selectedMood === null ? 'Complete your daily check-in to start journaling' : 'Wins, challenges, or anything you want to remember'}
            placeholderTextColor={Colors.textTertiary}
            value={journalText}
            onChangeText={setJournalText}
            maxLength={1000}
            editable={selectedMood !== null}
            scrollEnabled
            testID="journal-text-input"
          />
          <View style={styles.journalFooter}>
            <Text style={styles.charCount}>{journalText.length}/1000</Text>
            {selectedMood === null && (
              <Text style={styles.journalHint}>Log a mood first to unlock journaling</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.secondaryButton,
              selectedMood === null && styles.primaryButtonDisabled,
            ]}
            onPress={handleSaveJournalEntry}
            activeOpacity={0.85}
            disabled={selectedMood === null}
            testID="save-journal-entry-button"
          >
            <Text style={styles.secondaryButtonText}>Save journal entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toolCard} testID="meditation-card">
          <View style={styles.toolCardHeader}>
            <View style={[styles.toolIconBubble, styles.meditationIconBubble]}>
              <Waves size={22} color={Colors.white} />
            </View>
            <View style={styles.toolTitles}>
              <Text style={styles.toolTitle}>Meditation Tips & Tricks</Text>
              <Text style={styles.toolSubtitle}>Quick resets and grounding practices</Text>
            </View>
          </View>
          <View style={styles.toolDivider} />
          <Text style={styles.sectionDescription}>
            Step into curated breathwork, mindfulness, and calming techniques tailored to cravings and stress.
          </Text>
          <TouchableOpacity
            style={styles.meditationButton}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/meditation')}
            testID="open-meditation-button"
          >
            <Text style={styles.meditationButtonText}>Browse meditation library</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
        testID="past-entries-footer"
      >
        <TouchableOpacity
          style={styles.footerButton}
          activeOpacity={0.85}
          onPress={() => router.push('/past-entries')}
          testID="past-entries-button"
        >
          <History size={20} color={Colors.white} />
          <Text style={styles.footerButtonText}>Past entries</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: Colors.backgroundSecondary,
    gap: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  headerDate: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 140,
    gap: 20,
  },
  completedBanner: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  completedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  completedBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.4,
  },
  completedTextContainer: {
    flex: 1,
    gap: 4,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  completedSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  newEntryButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  newEntryButtonText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  toolCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 22,
    gap: 18,
    shadowColor: Colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  highlightedCard: {
    borderColor: Colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  toolCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  toolIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meditationIconBubble: {
    backgroundColor: '#7C3AED',
  },
  toolTitles: {
    flex: 1,
    gap: 2,
  },
  toolTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  toolSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  toolDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  moodScale: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '30%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  moodButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  moodNumberSelected: {
    color: Colors.white,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: Colors.white,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  meditationButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  meditationButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  journalInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 18,
    fontSize: 15,
    color: Colors.text,
    minHeight: 180,
    textAlignVertical: 'top',
    lineHeight: 22,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  journalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  journalHint: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.2,
  },
});
