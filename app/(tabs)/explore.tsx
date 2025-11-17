import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Flag, ShieldAlert, X, Bell } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { mockPosts } from '@/mocks/community';
import { Post } from '@/types/tally';
import { getCategoryOption } from '@/constants/tallies';
import { useTallies } from '@/contexts/tallies';

const reportReasons = [
  {
    key: 'inappropriate_nudity',
    label: 'Inappropriate nudity',
    description: 'Content that contains explicit or sexual imagery.',
  },
  {
    key: 'hate_speech',
    label: 'Hate speech',
    description: 'Language that attacks or discriminates against a group.',
  },
  {
    key: 'harassment_bullying',
    label: 'Harassment or bullying',
    description: 'Targeted harassment or threats toward an individual.',
  },
  {
    key: 'self_harm',
    label: 'Self-harm concern',
    description: 'Signals of self-harm or suicidal thoughts.',
  },
  {
    key: 'spam_scam',
    label: 'Spam or scam',
    description: 'Misleading promotions or attempts to scam users.',
  },
] as const;

type ReportReason = (typeof reportReasons)[number];

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tallies } = useTallies();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [posts] = useState<Post[]>(mockPosts);
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [focusedPost, setFocusedPost] = useState<Post | null>(null);

  const handleOpenReportModal = useCallback((post: Post) => {
    console.log('Opening report modal', { postId: post.id, category: post.category });
    setFocusedPost(post);
    setReportModalVisible(true);
  }, []);

  const handleCloseReportModal = useCallback(() => {
    console.log('Closing report modal');
    setReportModalVisible(false);
    setFocusedPost(null);
  }, []);

  const handleSelectReportReason = useCallback(
    (reasonKey: ReportReason['key']) => {
      const reasonDetails = reportReasons.find((reason) => reason.key === reasonKey);
      console.log('Report reason selected', {
        postId: focusedPost?.id,
        reasonKey,
      });
      setReportModalVisible(false);
      setFocusedPost(null);
      Alert.alert(
        'Report received',
        reasonDetails
          ? `Thank you for flagging: ${reasonDetails.label}.`
          : 'Thank you for helping keep the community safe.',
      );
    },
    [focusedPost],
  );

  const filterOptions = useMemo(() => {
    const baseFilters = [
      {
        key: 'all',
        label: 'All',
        emoji: '🌍',
        color: Colors.primary,
      },
    ];

    const tallyFilters = tallies.map((tally) => {
      const categoryOption = getCategoryOption(tally.category);
      return {
        key: tally.id,
        label: tally.customName ?? tally.title,
        emoji: categoryOption?.emoji ?? '🎯',
        color: categoryOption?.color ?? Colors.primary,
      };
    });

    return [...baseFilters, ...tallyFilters];
  }, [tallies]);

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') {
      return posts;
    }

    const selectedTally = tallies.find((tally) => tally.id === activeFilter);

    if (!selectedTally) {
      return posts;
    }

    return posts.filter((post) => {
      if (!post.category) {
        return false;
      }

      return post.category === selectedTally.category;
    });
  }, [posts, activeFilter, tallies]);

  useEffect(() => {
    if (activeFilter !== 'all' && !tallies.some((tally) => tally.id === activeFilter)) {
      setActiveFilter('all');
    }
  }, [activeFilter, tallies]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.logo}>Tally</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                console.log('Navigating to notifications from Explore');
                router.push('/notifications');
              }}
              activeOpacity={0.7}
              testID="explore-notifications-button"
            >
              <Bell size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Discover the community</Text>
      </LinearGradient>

      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterBubble,
                  isActive && {
                    backgroundColor: filter.color,
                    borderColor: filter.color,
                    shadowColor: filter.color,
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                  },
                ]}
                onPress={() => setActiveFilter(filter.key)}
                activeOpacity={0.7}
                testID={`explore-filter-${filter.key}`}
              >
                {filter.emoji && (
                  <Text style={[styles.filterEmoji, isActive && styles.filterEmojiActive]}>
                    {filter.emoji}
                  </Text>
                )}
                <Text
                  style={[
                    styles.filterBubbleText,
                    isActive && styles.filterBubbleTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {filteredPosts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <TouchableOpacity 
                style={styles.postUserInfo}
                onPress={() => router.push({ pathname: '/user-profile', params: { userId: post.userId } })}
                activeOpacity={0.7}
              >
                <View style={styles.avatar}>
                  {post.userAvatar ? (
                    <Image
                      source={{ uri: post.userAvatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {post.userName.charAt(0)}
                    </Text>
                  )}
                </View>
                <View>
                  <Text style={styles.userName}>{post.userName}</Text>
                  <Text style={styles.postTime}>
                    {formatTimeAgo(post.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
              {post.category && (
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        getCategoryOption(post.category as any)?.color ||
                        Colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.categoryBadgeText}>
                    {getCategoryOption(post.category as any)?.icon || '⭐'}
                  </Text>
                </View>
              )}
            </View>

            {post.content && (
              <Text style={styles.postContent}>{post.content}</Text>
            )}

            {post.imageUrl && (
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
              />
            )}

            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Heart size={20} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.reactions}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <MessageCircle size={20} color={Colors.textSecondary} />
                <Text style={styles.actionText}>{post.commentsCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.7}
                onPress={() => handleOpenReportModal(post)}
                testID={`report-post-${post.id}`}
              >
                <Flag size={20} color={Colors.danger ?? '#E11D48'} />
                <Text style={styles.actionText}>Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseReportModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseReportModal}
            testID="report-modal-backdrop"
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <ShieldAlert size={28} color={Colors.white} />
              </View>
              <View style={styles.modalTitleWrapper}>
                <Text style={styles.modalTitle}>Report content</Text>
                <Text style={styles.modalSubtitle}>
                  Let us know what feels off so our team can review it quickly.
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCloseReportModal}
                style={styles.closeButton}
                activeOpacity={0.7}
                testID="report-modal-close"
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalDivider} />
            <View style={styles.reasonsList}>
              {reportReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.key}
                  style={styles.reasonButton}
                  activeOpacity={0.75}
                  onPress={() => handleSelectReportReason(reason.key)}
                  testID={`report-reason-${reason.key}`}
                >
                  <View style={styles.reasonTextWrapper}>
                    <Text style={styles.reasonLabel}>{reason.label}</Text>
                    <Text style={styles.reasonDescription}>{reason.description}</Text>
                  </View>
                  <View style={styles.reasonChevron}>
                    <Text style={styles.reasonChevronText}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500' as const,
  },
  filterBarContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBar: {
    paddingHorizontal: 20,
    gap: 10,
    flexDirection: 'row',
  },
  filterBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterEmojiActive: {
    color: Colors.white,
  },
  filterBubbleText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  filterBubbleTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  postTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 16,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  modalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleWrapper: {
    flex: 1,
    gap: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 20,
    marginBottom: 12,
  },
  reasonsList: {
    gap: 12,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  reasonTextWrapper: {
    flex: 1,
    gap: 6,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  reasonDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  reasonChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  reasonChevronText: {
    fontSize: 20,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
});
