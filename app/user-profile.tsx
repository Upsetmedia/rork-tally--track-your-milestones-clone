import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, MessageSquare, User as UserIcon, Heart, ArrowLeft } from 'lucide-react-native';
import Colors from '../constants/colors';
import { User, Tally, Post } from '../types/tally';
import { mockUsers, getMockPostsByUser, getMockStatusesByUser, UserStatusUpdate } from '../mocks/community';
import { getCategoryOption } from '../constants/tallies';
import { calculateTimeElapsed } from '../utils/tally';
import { useAuth } from '../contexts/auth';

type ProfileTab = 'tallies' | 'followers' | 'following';
type FeedFilter = 'posts' | 'statuses';

type MockComment = {
  id: string;
  userName: string;
  avatarUrl: string;
  text: string;
  timeAgo: string;
};

type EnrichedPost = Post & {
  likes: number;
  comments: MockComment[];
};

const fallbackAvatar = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop';

const createMockComments = (prefix: string): MockComment[] => [
  {
    id: `${prefix}-c1`,
    userName: 'Quinn Rivers',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    text: 'Bookmarking this energy. Your reset is inspiring the whole circle.',
    timeAgo: '14m ago',
  },
  {
    id: `${prefix}-c2`,
    userName: 'Nico Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=200&auto=format&fit=crop',
    text: 'Need the blueprint for this ritual. Thank you for sharing.',
    timeAgo: '52m ago',
  },
  {
    id: `${prefix}-c3`,
    userName: 'Serena Dawn',
    avatarUrl: 'https://images.unsplash.com/photo-1521579971123-1192931a1452?q=80&w=200&auto=format&fit=crop',
    text: 'Goosebumps. Proud accountability partner moment right here.',
    timeAgo: '1h ago',
  },
];

const formatTimeAgo = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) {
    const minutes = Math.max(1, Math.floor(diff / minute));
    return `${minutes}m ago`;
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }
  if (diff < day * 7) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }
  const weeks = Math.floor(diff / (day * 7));
  return `${weeks}w ago`;
};

export default function UserProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const resolvedUserId = Array.isArray(userId) ? userId[0] : userId;
  const insets = useSafeAreaInsets();
  const { user: currentUser, followUser, unfollowUser, isFollowing } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('tallies');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('posts');
  const [showTalliesModal, setShowTalliesModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userTallies, setUserTallies] = useState<Tally[]>([]);
  const [enrichedPosts, setEnrichedPosts] = useState<EnrichedPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [selectedPost, setSelectedPost] = useState<EnrichedPost | null>(null);
  const [isPostModalVisible, setIsPostModalVisible] = useState<boolean>(false);
  const [commentDraft, setCommentDraft] = useState<string>('');

  const userPosts = useMemo(() => {
    if (!resolvedUserId) {
      return [] as Post[];
    }
    return getMockPostsByUser(resolvedUserId);
  }, [resolvedUserId]);

  const userStatuses = useMemo<UserStatusUpdate[]>(() => {
    if (!resolvedUserId) {
      return [];
    }
    return getMockStatusesByUser(resolvedUserId);
  }, [resolvedUserId]);

  const isOwnProfile = useMemo(() => {
    if (!user || !currentUser) {
      return false;
    }
    return currentUser.id === user.id;
  }, [user, currentUser]);

  const isFollowingUser = useMemo(() => {
    if (!user) {
      return false;
    }
    return isFollowing(user.id);
  }, [user, isFollowing]);

  const loadUserTallies = useCallback((uid: string) => {
    console.log('[UserProfile] Loading tallies for user', uid);
    const mockTallies: Tally[] = [
      {
        id: `${uid}-1`,
        type: 'sobriety',
        category: 'alcohol',
        title: 'No Alcohol',
        startDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
        dailyCost: 15,
        reason: 'For my health and family',
        tags: [],
        createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      },
      {
        id: `${uid}-2`,
        type: 'life-event',
        category: 'working-out',
        title: 'Daily Exercise',
        startDate: Date.now() - 60 * 24 * 60 * 60 * 1000,
        dailyCost: 0,
        reason: 'Building a healthier lifestyle',
        tags: [],
        createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      },
    ];
    setUserTallies(mockTallies);
  }, []);

  useEffect(() => {
    if (!resolvedUserId) {
      console.log('[UserProfile] No user id provided');
      return;
    }
    const foundUser = mockUsers.find(u => u.id === resolvedUserId);
    if (foundUser) {
      console.log('[UserProfile] Loaded user profile', foundUser.id);
      setUser(foundUser);
      loadUserTallies(resolvedUserId);
    } else {
      console.log('[UserProfile] User not found', resolvedUserId);
    }
  }, [resolvedUserId, loadUserTallies]);

  useEffect(() => {
    setEnrichedPosts(
      userPosts.map(post => ({
        ...post,
        likes: post.reactions,
        comments: createMockComments(`post-${post.id}`),
      })),
    );
  }, [userPosts]);

  const handleMessage = useCallback(() => {
    if (!user) {
      return;
    }
    Alert.alert('Message', `Start a conversation with ${user.name}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send Message', onPress: () => console.log('[UserProfile] Opening DM composer for', user.id) },
    ]);
  }, [user]);

  const handleFollowToggle = useCallback(async () => {
    if (!user) {
      console.log('[UserProfile] Follow toggle ignored: no user loaded');
      return;
    }
    if (isOwnProfile) {
      console.log('[UserProfile] Follow toggle ignored: own profile');
      return;
    }
    const currentlyFollowing = isFollowing(user.id);
    console.log('[UserProfile] Toggling follow state', { userId: user.id, currentlyFollowing });
    if (currentlyFollowing) {
      await unfollowUser(user.id);
      setUser(prev => (prev ? { ...prev, followersCount: Math.max(0, prev.followersCount - 1) } : prev));
    } else {
      await followUser(user.id);
      setUser(prev => (prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev));
    }
  }, [user, isOwnProfile, isFollowing, followUser, unfollowUser]);

  const handleFeedFilterChange = useCallback((filter: FeedFilter) => {
    console.log('[UserProfile] Switching feed filter', filter);
    setFeedFilter(filter);
  }, []);

  const handleOpenPost = useCallback((post: EnrichedPost) => {
    setSelectedPost(post);
    setCommentDraft('');
    setIsPostModalVisible(true);
  }, []);

  const handleClosePost = useCallback(() => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
    setCommentDraft('');
  }, []);

  const handleToggleLike = useCallback((postId: string) => {
    setLikedPosts(prev => {
      const currentlyLiked = prev[postId] ?? false;
      const nextLiked = !currentlyLiked;
      setEnrichedPosts(existing => existing.map(post => {
        if (post.id !== postId) {
          return post;
        }
        return { ...post, likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)) };
      }));
      setSelectedPost(current => {
        if (!current || current.id !== postId) {
          return current;
        }
        return { ...current, likes: Math.max(0, current.likes + (nextLiked ? 1 : -1)) };
      });
      return { ...prev, [postId]: nextLiked };
    });
  }, []);

  const handleAddComment = useCallback(() => {
    if (!selectedPost) {
      return;
    }
    const trimmed = commentDraft.trim();
    if (trimmed.length === 0) {
      return;
    }
    const newComment: MockComment = {
      id: `${selectedPost.id}-comment-${Date.now()}`,
      userName: currentUser?.name ?? 'You',
      avatarUrl: currentUser?.avatarUrl ?? fallbackAvatar,
      text: trimmed,
      timeAgo: 'Just now',
    };
    setEnrichedPosts(existing => existing.map(post => {
      if (post.id !== selectedPost.id) {
        return post;
      }
      return { ...post, comments: [newComment, ...post.comments] };
    }));
    setSelectedPost(current => {
      if (!current) {
        return current;
      }
      return { ...current, comments: [newComment, ...current.comments] };
    });
    setCommentDraft('');
  }, [commentDraft, selectedPost, currentUser?.name, currentUser?.avatarUrl]);

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.profileHeader, { paddingTop: insets.top + 20 }]}>        
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          activeOpacity={0.7}
          testID="close-profile-button"
        >
          <X size={28} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.profilePicContainer}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePic}>
              <UserIcon size={40} color={Colors.white} />
            </View>
          )}
        </View>
        <Text style={styles.userName}>@{user.username}</Text>
        {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}

        <View style={styles.bubbleRow}>
          <TouchableOpacity
            style={[styles.bubble, activeTab === 'tallies' && styles.bubbleActive]}
            onPress={() => {
              console.log('[UserProfile] Opening tallies modal');
              setActiveTab('tallies');
              setShowTalliesModal(true);
            }}
            activeOpacity={0.7}
            testID="user-tallies-bubble"
          >
            <Text style={[styles.bubbleNumber, activeTab === 'tallies' && styles.bubbleNumberActive]}>
              {userTallies.length}
            </Text>
            <Text style={[styles.bubbleLabel, activeTab === 'tallies' && styles.bubbleLabelActive]}>
              Tallies
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bubble, activeTab === 'followers' && styles.bubbleActive]}
            onPress={() => setActiveTab('followers')}
            activeOpacity={0.7}
            testID="user-followers-bubble"
          >
            <Text style={[styles.bubbleNumber, activeTab === 'followers' && styles.bubbleNumberActive]}>
              {user.followersCount}
            </Text>
            <Text style={[styles.bubbleLabel, activeTab === 'followers' && styles.bubbleLabelActive]}>
              Followers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bubble, activeTab === 'following' && styles.bubbleActive]}
            onPress={() => setActiveTab('following')}
            activeOpacity={0.7}
            testID="user-following-bubble"
          >
            <Text style={[styles.bubbleNumber, activeTab === 'following' && styles.bubbleNumberActive]}>
              {user.followingCount}
            </Text>
            <Text style={[styles.bubbleLabel, activeTab === 'following' && styles.bubbleLabelActive]}>
              Following
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          {!isOwnProfile && (
            <TouchableOpacity
              style={[styles.followButton, isFollowingUser && styles.followButtonActive]}
              onPress={handleFollowToggle}
              activeOpacity={0.7}
              testID="follow-toggle-button"
            >
              <Text style={[styles.followButtonText, isFollowingUser && styles.followButtonTextActive]}>
                {isFollowingUser ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessage}
            activeOpacity={0.7}
            testID="message-user-button"
          >
            <MessageSquare size={18} color={Colors.primary} />
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'tallies' && (
        <View style={styles.postToggleBar}>
          <TouchableOpacity
            style={[styles.toggleButton, feedFilter === 'posts' && styles.toggleButtonActive]}
            onPress={() => handleFeedFilterChange('posts')}
            activeOpacity={0.7}
            testID="user-posts-filter"
          >
            <Text style={[styles.toggleButtonText, feedFilter === 'posts' && styles.toggleButtonTextActive]}>
              🖼️ Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, feedFilter === 'statuses' && styles.toggleButtonActive]}
            onPress={() => handleFeedFilterChange('statuses')}
            activeOpacity={0.7}
            testID="user-statuses-filter"
          >
            <Text style={[styles.toggleButtonText, feedFilter === 'statuses' && styles.toggleButtonTextActive]}>
              📝 Statuses
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'tallies' && feedFilter === 'posts' && (
          <View style={styles.instagramSection} testID="user-posts-feed">
            {enrichedPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🗒️</Text>
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyText}>When this member shares updates, they will appear here.</Text>
              </View>
            ) : (
              <View style={styles.instagramGrid}>
                {enrichedPosts.map((post) => (
                  <TouchableOpacity
                    key={post.id}
                    style={styles.gridItem}
                    activeOpacity={0.85}
                    onPress={() => handleOpenPost(post)}
                    testID={`user-post-${post.id}`}
                  >
                    <Image source={{ uri: post.imageUrl ?? fallbackAvatar }} style={styles.gridImage} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'tallies' && feedFilter === 'statuses' && (
          <View style={styles.feedSection} testID="user-statuses-feed">
            {userStatuses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyTitle}>No status updates yet</Text>
                <Text style={styles.emptyText}>Check back soon for real-time progress notes.</Text>
              </View>
            ) : (
              userStatuses.map(status => (
                <View key={status.id} style={styles.statusCard}>
                  <View style={styles.statusHeader}>
                    <View style={styles.statusHeaderLeft}>
                      <Image
                        source={{ uri: user.avatarUrl ?? fallbackAvatar }}
                        style={styles.postAvatar}
                      />
                      <View>
                        <Text style={styles.postUserName}>{user.name}</Text>
                        <Text style={styles.postTime}>{status.timeAgo}</Text>
                      </View>
                    </View>
                    <View style={styles.statusTag}>
                      <Text style={styles.statusTagText}>{status.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.statusContent}>{status.content}</Text>
                  <View style={styles.statusFooter}>
                    <View style={styles.statusMetric}>
                      <Heart size={16} color={Colors.textSecondary} />
                      <Text style={styles.statusMetricText}>{status.likes}</Text>
                    </View>
                    <View style={styles.statusMetric}>
                      <MessageSquare size={16} color={Colors.textSecondary} />
                      <Text style={styles.statusMetricText}>{status.comments}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'followers' && (
          <View style={styles.section} testID="user-followers-section">
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyTitle}>Followers</Text>
              <Text style={styles.emptyText}>
                {user.followersCount} members are tracking alongside this journey.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'following' && (
          <View style={styles.section} testID="user-following-section">
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🤝</Text>
              <Text style={styles.emptyTitle}>Following</Text>
              <Text style={styles.emptyText}>
                Following {user.followingCount} creators and accountability partners.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isPostModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClosePost}
      >
        <View style={styles.postModalOverlay}>
          <View style={styles.postModalContent}>
            <View style={styles.postModalHeader}>
              <View style={styles.postModalHeaderLeft}>
                <TouchableOpacity
                  onPress={handleClosePost}
                  activeOpacity={0.7}
                  style={styles.postModalBackButton}
                  testID="back-user-post-modal"
                >
                  <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Image source={{ uri: user.avatarUrl ?? fallbackAvatar }} style={styles.modalAvatar} />
                <View>
                  <Text style={styles.modalUserName}>{user.name}</Text>
                  <Text style={styles.modalMeta}>
                    {selectedPost ? formatTimeAgo(selectedPost.createdAt) : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClosePost} activeOpacity={0.7} testID="close-user-post-modal">
                <X size={26} color={Colors.text} />
              </TouchableOpacity>
            </View>
            {selectedPost && (
              <>
                <Image source={{ uri: selectedPost.imageUrl ?? fallbackAvatar }} style={styles.postModalImage} resizeMode="cover" />
                <View style={styles.postModalInfo}>
                  <Text style={styles.postModalCaption}>{selectedPost.content}</Text>
                  <View style={styles.postMetaRow}>
                    <TouchableOpacity
                      style={[styles.likeButton, likedPosts[selectedPost.id] && styles.likeButtonActive]}
                      onPress={() => handleToggleLike(selectedPost.id)}
                      activeOpacity={0.75}
                      testID="like-user-post-button"
                    >
                      <Heart size={20} color={likedPosts[selectedPost.id] ? Colors.white : Colors.primary} />
                      <Text style={[styles.likeButtonText, likedPosts[selectedPost.id] && styles.likeButtonTextActive]}>
                        {selectedPost.likes.toLocaleString()} likes
                      </Text>
                    </TouchableOpacity>
                    <View style={styles.metaDivider} />
                    <View style={styles.commentCount}>
                      <MessageSquare size={18} color={Colors.primary} />
                      <Text style={styles.commentCountText}>{selectedPost.comments.length} comments</Text>
                    </View>
                  </View>
                  <ScrollView
                    style={styles.commentList}
                    contentContainerStyle={styles.commentListContent}
                    showsVerticalScrollIndicator={false}
                    testID="user-post-comments"
                  >
                    {selectedPost.comments.map(comment => (
                      <View key={comment.id} style={styles.commentItem}>
                        <Image source={{ uri: comment.avatarUrl }} style={styles.commentAvatar} />
                        <View style={styles.commentBody}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentAuthor}>{comment.userName}</Text>
                            <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                          </View>
                          <Text style={styles.commentText}>{comment.text}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.commentInputRow}>
                    <Image source={{ uri: currentUser?.avatarUrl ?? fallbackAvatar }} style={styles.commentAvatarSmall} />
                    <TextInput
                      value={commentDraft}
                      onChangeText={setCommentDraft}
                      placeholder="Add a comment..."
                      placeholderTextColor={Colors.textTertiary}
                      style={styles.commentInput}
                      returnKeyType="send"
                      onSubmitEditing={handleAddComment}
                      testID="user-comment-input"
                    />
                    <TouchableOpacity
                      onPress={handleAddComment}
                      activeOpacity={0.7}
                      style={styles.commentSendButton}
                      testID="user-submit-comment-button"
                    >
                      <Text style={styles.commentSendText}>Post</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTalliesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTalliesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Public Tallies</Text>
              <TouchableOpacity
                onPress={() => setShowTalliesModal(false)}
                activeOpacity={0.7}
                testID="close-tallies-modal"
              >
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.tallyScroll}
              contentContainerStyle={styles.tallyScrollContent}
              testID="user-tally-modal"
            >
              {userTallies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyTitle}>No public tallies</Text>
                  <Text style={styles.emptyText}>This member keeps their tallies private for now.</Text>
                </View>
              ) : (
                userTallies.map((tally, index) => {
                  const { totalDays, hours, minutes, seconds } = calculateTimeElapsed(tally.startDate);
                  const categoryOption = getCategoryOption(tally.category, tally.subcategory);
                  return (
                    <View
                      key={tally.id}
                      style={[
                        styles.tallyItem,
                        index === userTallies.length - 1 && { borderBottomWidth: 0 },
                      ]}
                      testID={`user-tally-${tally.id}`}
                    >
                      <View style={styles.tallyLeft}>
                        <View style={[styles.tallyBadge, { backgroundColor: categoryOption.color }]}>
                          <Text style={styles.tallyBadgeText}>{categoryOption.emoji}</Text>
                        </View>
                        <View>
                          <Text style={styles.tallyName}>{tally.title}</Text>
                          <Text style={styles.tallyDuration}>
                            {totalDays}d {hours}h {minutes}m {seconds}s
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
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
  profileHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute' as const,
    left: 16,
    top: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  profilePicContainer: {
    marginBottom: 14,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  userBio: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  bubbleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bubbleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bubbleNumber: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  bubbleNumberActive: {
    color: Colors.white,
  },
  bubbleLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  bubbleLabelActive: {
    color: Colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  followButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  followButtonActive: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  followButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  followButtonTextActive: {
    color: Colors.primary,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  postToggleBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 80,
    gap: 20,
  },
  feedSection: {
    gap: 16,
  },
  instagramSection: {
    gap: 16,
  },
  instagramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6,
  },
  gridItem: {
    width: '32%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  postAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.backgroundSecondary,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  statusContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  statusFooter: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
  },
  statusMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusMetricText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  section: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '75%',
    gap: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  tallyScroll: {
    maxHeight: 400,
  },
  tallyScrollContent: {
    gap: 12,
  },
  tallyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tallyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tallyBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tallyBadgeText: {
    fontSize: 22,
  },
  tallyName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tallyDuration: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  postModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 16, 0.72)',
    justifyContent: 'flex-end',
  },
  postModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 34,
    overflow: 'hidden',
  },
  postModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 18,
  },
  postModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postModalBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 2,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  postModalImage: {
    width: '100%',
    height: 360,
  },
  postModalInfo: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 18,
  },
  postModalCaption: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  postMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(118, 93, 255, 0.12)',
    borderRadius: 999,
  },
  likeButtonActive: {
    backgroundColor: Colors.primary,
  },
  likeButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  likeButtonTextActive: {
    color: Colors.white,
  },
  metaDivider: {
    width: 1,
    height: 22,
    backgroundColor: Colors.border,
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentCountText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  commentList: {
    maxHeight: 220,
  },
  commentListContent: {
    gap: 16,
    paddingBottom: 8,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  commentAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  commentSendButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  commentSendText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
});
