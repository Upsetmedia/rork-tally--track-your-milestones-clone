import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Calendar, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTallies } from '@/contexts/tallies';
import { getCategoryOption, MILESTONES } from '@/constants/tallies';
import { calculateTimeElapsed } from '@/utils/tally';

interface TimelineEvent {
  id: string;
  type: 'milestone' | 'created';
  tallyId: string;
  tallyName: string;
  icon: string;
  color: string;
  date: number;
  daysElapsed?: number;
  milestone?: { days: number; label: string };
}

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const { tallies } = useTallies();

  const events: TimelineEvent[] = [];

  tallies.forEach((tally) => {
    const option = getCategoryOption(tally.category);
    const displayName = tally.customName || option?.label || tally.category;
    const { totalDays } = calculateTimeElapsed(tally.startDate);
    
    events.push({
      id: `${tally.id}-created`,
      type: 'created',
      tallyId: tally.id,
      tallyName: displayName,
      icon: option?.icon || '⭐',
      color: option?.color || Colors.primary,
      date: tally.createdAt,
    });

    MILESTONES.forEach((milestone) => {
      if (milestone.days <= totalDays) {
        const milestoneDate = tally.startDate + milestone.days * 24 * 60 * 60 * 1000;
        events.push({
          id: `${tally.id}-milestone-${milestone.days}`,
          type: 'milestone',
          tallyId: tally.id,
          tallyName: displayName,
          icon: option?.icon || '⭐',
          color: option?.color || Colors.primary,
          date: milestoneDate,
          daysElapsed: milestone.days,
          milestone,
        });
      }
    });
  });

  events.sort((a, b) => b.date - a.date);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.logo}>Timeline</Text>
        <Text style={styles.subtitle}>Your Journey History</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No Timeline Yet</Text>
            <Text style={styles.emptyText}>
              Your journey events and milestones will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.timelineContainer}>
            {events.map((event, index) => (
              <View key={event.id} style={styles.eventContainer}>
                <View style={styles.eventLine}>
                  <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                  {index < events.length - 1 && <View style={styles.eventConnector} />}
                </View>
                <View style={styles.eventCard}>
                  <View style={styles.eventHeader}>
                    <View style={[styles.eventIconContainer, { backgroundColor: event.color }]}>
                      {event.type === 'milestone' ? (
                        <Trophy size={20} color={Colors.white} />
                      ) : event.type === 'created' ? (
                        <Heart size={20} color={Colors.white} />
                      ) : (
                        <Calendar size={20} color={Colors.white} />
                      )}
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventTitle}>
                        {event.type === 'milestone' 
                          ? `🎉 ${event.milestone?.label} Milestone!`
                          : `Started ${event.tallyName}`
                        }
                      </Text>
                      <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.eventBody}>
                    <Text style={styles.eventEmoji}>{event.icon}</Text>
                    <Text style={styles.eventTally}>{event.tallyName}</Text>
                    {event.type === 'milestone' && (
                      <Text style={styles.eventDescription}>
                        Achieved {event.daysElapsed} days clean
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
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
  logo: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  timelineContainer: {
    paddingHorizontal: 8,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  eventLine: {
    width: 40,
    alignItems: 'center',
  },
  eventDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  eventConnector: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  eventBody: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  eventEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  eventTally: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
