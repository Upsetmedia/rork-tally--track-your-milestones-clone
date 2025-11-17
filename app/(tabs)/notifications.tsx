import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Trophy, Heart, UserPlus, ChevronRight, CheckCheck, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';

type NotificationCategory = 'likes' | 'followers' | 'milestone';

type Participant = {
  id: string;
  name: string;
  avatarUrl: string;
};

type GroupedNotification = {
  id: string;
  category: NotificationCategory;
  headline: string;
  detail: string;
  timestamp: number;
  read: boolean;
  participants: Participant[];
  othersCount?: number;
  contextTitle: string;
  contextSubtitle?: string;
  ctaLabel?: string;
};

const accentColors: Record<NotificationCategory, string> = {
  likes: Colors.danger,
  followers: Colors.primary,
  milestone: Colors.warning,
};

const accentSurfaces: Record<NotificationCategory, string> = {
  likes: 'rgba(239, 68, 68, 0.12)',
  followers: 'rgba(99, 102, 241, 0.12)',
  milestone: 'rgba(245, 158, 11, 0.12)',
};

const categoryLabels: Record<NotificationCategory, string> = {
  likes: 'Post likes',
  followers: 'New followers',
  milestone: 'Milestone',
};

const groupedNotificationsSeed: GroupedNotification[] = [
  {
    id: 'likes-1',
    category: 'likes',
    headline: 'Britney Lane and 200 others liked your post',
    detail: '“Day 60 reset ritual” is trending across the community feed right now.',
    timestamp: Date.now() - 45 * 60 * 1000,
    read: false,
    participants: [
      {
        id: 'p-britney',
        name: 'Britney Lane',
        avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
      },
      {
        id: 'p-sarah',
        name: 'Sarah Martinez',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      },
      {
        id: 'p-marcus',
        name: 'Marcus Chen',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      },
    ],
    othersCount: 200,
    contextTitle: 'Post • Day 60 reset ritual',
    contextSubtitle: 'Tap to revisit the momentum check-in and keep the thread active.',
    ctaLabel: 'View post',
  },
  {
    id: 'followers-1',
    category: 'followers',
    headline: 'Jonah Rivers and 12 others started following you',
    detail: 'Your 90-day streak update pulled in a wave of new supporters this week.',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    read: false,
    participants: [
      {
        id: 'p-jonah',
        name: 'Jonah Rivers',
        avatarUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80',
      },
      {
        id: 'p-lia',
        name: 'Lia Harper',
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80',
      },
      {
        id: 'p-noah',
        name: 'Noah Flynn',
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=160&q=80',
      },
    ],
    othersCount: 12,
    contextTitle: 'New followers this week',
    contextSubtitle: 'Send a quick hello or share a ritual to welcome them in.',
    ctaLabel: 'View followers',
  },
  {
    id: 'milestone-1',
    category: 'milestone',
    headline: '120-day milestone unlocked on “No Alcohol Reset”',
    detail: 'Celebrate it with a gratitude drop or update your tracker story.',
    timestamp: Date.now() - 26 * 60 * 60 * 1000,
    read: true,
    participants: [],
    contextTitle: 'Tracker • No Alcohol Reset',
    contextSubtitle: 'Keep the streak by logging your evening check-in tonight.',
    ctaLabel: 'View milestone',
  },
];

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.max(1, Math.floor(diff / (1000 * 60)));
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return `${days}d ago`;
}

function getCategoryIcon(category: NotificationCategory, accent: string) {
  if (category === 'likes') {
    return <Heart size={16} color={accent} />;
  }
  if (category === 'followers') {
    return <UserPlus size={16} color={accent} />;
  }
  return <Trophy size={16} color={accent} />;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState<GroupedNotification[]>(groupedNotificationsSeed);
  const [expandedNotifications, setExpandedNotifications] = useState<string[]>([]);

  const unreadCount = useMemo(() => notifications.filter(notification => !notification.read).length, [notifications]);

  const handleBackPress = useCallback(() => {
    console.log('NotificationsScreen: back button pressed');
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }, [router]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications(previous => previous.map(notification => ({ ...notification, read: true })));
  }, []);

  const handleNotificationPress = useCallback((id: string) => {
    setNotifications(previous => previous.map(notification => {
      if (notification.id === id) {
        return { ...notification, read: true };
      }
      return notification;
    }));
    setExpandedNotifications(previous => {
      if (previous.includes(id)) {
        return previous.filter(expandedId => expandedId !== id);
      }
      return [...previous, id];
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              onPress={handleBackPress}
              activeOpacity={0.7}
              style={styles.backButton}
              testID="notifications-back-button"
            >
              <ArrowLeft size={20} color={Colors.white} />
            </TouchableOpacity>
            <View>
              <Text style={styles.logo}>Notifications</Text>
              <Text style={styles.subtitle} testID="notification-summary-label">
                {unreadCount > 0 ? `${unreadCount} unread updates` : 'You are all caught up'}
              </Text>
            </View>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllRead}
              activeOpacity={0.7}
              testID="mark-all-read-button"
            >
              <CheckCheck size={18} color={Colors.white} />
              <Text style={styles.markAllText}>Mark all</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {notifications.map(notification => {
          const accent = accentColors[notification.category];
          const surface = accentSurfaces[notification.category];
          const isExpanded = expandedNotifications.includes(notification.id);
          return (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}
              onPress={() => handleNotificationPress(notification.id)}
              activeOpacity={0.8}
              testID={`notification-group-${notification.id}`}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.avatarCluster}>
                  {notification.category === 'milestone' ? (
                    <View style={[styles.iconBadge, { backgroundColor: surface, borderColor: accent }]}>
                      <Trophy size={24} color={accent} />
                    </View>
                  ) : (
                    <View style={styles.avatarStackWrapper}>
                      {notification.participants.slice(0, 3).map((participant, index) => (
                        <Image
                          key={participant.id}
                          source={{ uri: participant.avatarUrl }}
                          style={[styles.avatarImage, index > 0 && styles.avatarImageOverlap]}
                        />
                      ))}
                      {typeof notification.othersCount === 'number' && notification.othersCount > 0 && (
                        <View style={[styles.avatarOverflow, notification.participants.length > 0 && styles.avatarImageOverlap]}>
                          <Text style={styles.avatarOverflowText}>
                            +{notification.othersCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <View style={styles.topRightWrap}>
                  {!notification.read && <View style={styles.unreadDot} />}
                  <Text style={styles.timestamp}>{formatTimeAgo(notification.timestamp)}</Text>
                  <ChevronRight
                    size={18}
                    color={Colors.textSecondary}
                    style={[styles.chevronIcon, isExpanded && styles.chevronIconExpanded]}
                  />
                </View>
              </View>

              <View style={styles.textBlock}>
                <Text style={styles.headline} numberOfLines={isExpanded ? undefined : 2}>
                  {notification.headline}
                </Text>
                {isExpanded ? (
                  <Text style={styles.detail}>{notification.detail}</Text>
                ) : null}
              </View>

              {isExpanded ? (
                <>
                  <View style={styles.metaRow}>
                    <View style={[styles.categoryPill, { backgroundColor: surface }]}>
                      {getCategoryIcon(notification.category, accent)}
                      <Text style={[styles.categoryText, { color: accent }]}>
                        {categoryLabels[notification.category]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.contextBlock}>
                    <View style={styles.contextTextWrapper}>
                      <Text style={styles.contextTitle}>{notification.contextTitle}</Text>
                      {notification.contextSubtitle ? (
                        <Text style={styles.contextSubtitle}>{notification.contextSubtitle}</Text>
                      ) : null}
                    </View>
                    <View style={styles.ctaRow}>
                      {notification.ctaLabel ? (
                        <Text style={[styles.ctaLabel, { color: accent }]}>{notification.ctaLabel}</Text>
                      ) : null}
                      <ChevronRight size={18} color={accent} />
                    </View>
                  </View>
                </>
              ) : null}
            </TouchableOpacity>
          );
        })}
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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.88,
    marginTop: 6,
    fontWeight: '500' as const,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.24)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  markAllText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: 120,
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    gap: 16,
  },
  notificationCardUnread: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStackWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.backgroundSecondary,
  },
  avatarImageOverlap: {
    marginLeft: -14,
  },
  avatarOverflow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverflowText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  iconBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  textBlock: {
    gap: 8,
  },
  headline: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
    lineHeight: 24,
  },
  detail: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  contextBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  contextTextWrapper: {
    flex: 1,
    gap: 6,
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  contextSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
});
