import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import BackButton from '../components/BackButton';
import Colors from '../constants/colors';
import { useJournal } from '../contexts/journal';

const MOODS = [
  { emoji: '😩', label: 'Terrible', value: 1 },
  { emoji: '😢', label: 'Bad', value: 2 },
  { emoji: '😔', label: 'Down', value: 3 },
  { emoji: '😕', label: 'Meh', value: 4 },
  { emoji: '😐', label: 'Okay', value: 5 },
  { emoji: '🙂', label: 'Good', value: 6 },
  { emoji: '😌', label: 'Great', value: 7 },
  { emoji: '😄', label: 'Happy', value: 8 },
  { emoji: '🤩', label: 'Amazing', value: 9 },
  { emoji: '🧘', label: 'Peaceful', value: 10 },
];

const getMoodData = (moodValue: number) => {
  const mood = MOODS.find((m) => m.value === moodValue);
  return mood ?? { emoji: '😐', label: 'Unknown', value: moodValue };
};

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const dateText = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timeText = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return { dateText, timeText };
};

export default function PastEntriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries } = useJournal();

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
    console.log('[PastEntriesScreen] sorted entries', sorted.map((entry) => entry.id));
    return sorted;
  }, [entries]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerTop}>
          <BackButton
            color={Colors.white}
            style={styles.backButton}
            testID="past-entries-back"
          />
          <Text style={styles.logo}>Past Entries</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {sortedEntries.length > 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            <Text style={styles.sectionSubtitle}>
              Reflect on everything you have shared so far
            </Text>
          </View>
        )}

        {sortedEntries.map((entry) => {
          const moodData = getMoodData(entry.mood);
          const { dateText, timeText } = formatTimestamp(entry.timestamp);

          return (
            <View
              key={entry.id}
              style={styles.entryCard}
              testID={`past-entry-card-${entry.id}`}
            >
              <View style={styles.entryTopRow}>
                <View style={styles.moodBubble}>
                  <Text style={styles.moodEmoji}>{moodData.emoji}</Text>
                </View>
                <View style={styles.entryMeta}>
                  <Text style={styles.entryDateText}>{dateText}</Text>
                  <Text style={styles.entryTimeText}>{timeText}</Text>
                </View>
              </View>

              <View style={styles.moodRow}>
                <Text style={styles.moodLabel}>Mood</Text>
                <Text style={styles.moodValue}>{moodData.label}</Text>
                <Text style={styles.moodScore}>{entry.mood}/10</Text>
              </View>

              {entry.entry && (
                <View style={styles.entryBody}>
                  <Text style={styles.entryBodyText}>{entry.entry}</Text>
                </View>
              )}
            </View>
          );
        })}

        {sortedEntries.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📘</Text>
            <Text style={styles.emptyTitle}>No Entries Yet</Text>
            <Text style={styles.emptyText}>
              Start logging your daily check-ins to see them here
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
    gap: 20,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  entryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#00000033',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  entryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  moodBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  moodEmoji: {
    fontSize: 32,
  },
  entryMeta: {
    flex: 1,
    gap: 4,
  },
  entryDateText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  entryTimeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  moodValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  moodScore: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  entryBody: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 16,
  },
  entryBodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
  emptyEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
