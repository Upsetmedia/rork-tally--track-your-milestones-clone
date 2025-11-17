import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Platform, Image, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageSquare, Heart, Camera, X, ArrowLeft, Bell } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { useTallies } from '../../contexts/tallies';
import { useAuth } from '../../contexts/auth';
import { getCategoryOption } from '../../constants/tallies';
import { calculateTimeElapsed } from '../../utils/tally';

type ProfileTab = 'tallies' | 'followers' | 'following';
type PostFilter = 'posts' | 'statuses';

type MockComment = {
  id: string;
  userName: string;
  avatarUrl: string;
  text: string;
  timeAgo: string;
};

type MockPhoto = {
  id: string;
  imageUrl: string;
  mood: string;
  location: string;
  postedAt: string;
  caption: string;
  likes: number;
  comments: MockComment[];
};

type MockStatus = {
  id: string;
  content: string;
  timeAgo: string;
  likes: number;
  comments: number;
  tag: string;
};

type MockSocialProfile = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  sobrietyDays: number;
  statusSnippet: string;
  mutualCount: number;
  isOnline: boolean;
};

const fallbackAvatar = 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop';

const createComments = (prefix: string): MockComment[] => [
  {
    id: `${prefix}-c1`,
    userName: 'Naomi Flux',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    text: 'This energy is unreal. Proud of you for sharing the journey.',
    timeAgo: '12m ago',
  },
  {
    id: `${prefix}-c2`,
    userName: 'Mason Rowe',
    avatarUrl: 'https://images.unsplash.com/photo-1542293787938-4d2226c6e239?q=80&w=200&auto=format&fit=crop',
    text: 'Need this exact vibe for my next reset. Adding to my inspiration board.',
    timeAgo: '34m ago',
  },
  {
    id: `${prefix}-c3`,
    userName: 'Lia Harper',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop',
    text: 'The glow is real. Keep stacking these wins.',
    timeAgo: '1h ago',
  },
];

const mockPhotos: MockPhoto[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop',
    mood: 'Sunrise reset',
    location: 'Venice Beach, CA',
    postedAt: '2h ago',
    caption: 'Sunrise reset with the crew. Breathing in the future we’re building.',
    likes: 284,
    comments: createComments('p1'),
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1515169067865-5387ec356754?q=80&w=900&auto=format&fit=crop',
    mood: 'Community meetup vibes',
    location: 'Studio Loft',
    postedAt: '5h ago',
    caption: 'Community meetup vibes. Zero-proof pours, high-frequency convos.',
    likes: 198,
    comments: createComments('p2'),
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=900&auto=format&fit=crop',
    mood: 'Mocktail magic',
    location: 'Julian’s Kitchen',
    postedAt: 'Yesterday',
    caption: 'Mocktail lab night. Every ritual gets a mindful remix.',
    likes: 312,
    comments: createComments('p3'),
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=900&auto=format&fit=crop',
    mood: 'Trail therapy',
    location: 'Runyon Canyon',
    postedAt: '2d ago',
    caption: 'Trail therapy with the accountability squad. Pace > perfection.',
    likes: 176,
    comments: createComments('p4'),
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=900&auto=format&fit=crop',
    mood: 'Deep focus',
    location: 'Creative Studio',
    postedAt: '3d ago',
    caption: 'Locking in deep work sessions, no distractions. Discipline is aesthetic.',
    likes: 256,
    comments: createComments('p5'),
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=900&auto=format&fit=crop',
    mood: 'Weekend reset',
    location: "Harper's Place",
    postedAt: '1w ago',
    caption: 'Weekend reset ritual. Nourish the body, charge the spirit.',
    likes: 221,
    comments: createComments('p6'),
  },
  {
    id: '7',
    imageUrl: 'https://images.unsplash.com/photo-1521579971123-1192931a1452?q=80&w=900&auto=format&fit=crop',
    mood: 'Studio lightwork',
    location: 'Midtown Loft',
    postedAt: '1w ago',
    caption: 'Studio lightwork and gratitude journaling. Staying grounded.',
    likes: 187,
    comments: createComments('p7'),
  },
  {
    id: '8',
    imageUrl: 'https://images.unsplash.com/photo-1531512073830-ba890ca4eba2?q=80&w=900&auto=format&fit=crop',
    mood: 'Reset retreat',
    location: 'Joshua Tree',
    postedAt: '2w ago',
    caption: 'Reset retreat in the desert. Silence speaks the loudest.',
    likes: 294,
    comments: createComments('p8'),
  },
  {
    id: '9',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=900&auto=format&fit=crop',
    mood: 'City sunset laps',
    location: 'Brooklyn Bridge Park',
    postedAt: '3w ago',
    caption: 'Sunset pace runs while the city pulses. Movement saved me.',
    likes: 342,
    comments: createComments('p9'),
  },
];

const mockStatuses: MockStatus[] = [
  {
    id: 'status-1',
    content: 'Day 87: Morning run, cold plunge, journaling. The routine is sticking and my energy is locked in. Proud of the consistency.',
    timeAgo: '45m ago',
    likes: 128,
    comments: 21,
    tag: 'Momentum',
  },
  {
    id: 'status-2',
    content: 'Broke through my first craving this month. Texted my accountability partner and rode the wave. If you’re struggling, reach out before it gets loud.',
    timeAgo: '3h ago',
    likes: 302,
    comments: 48,
    tag: 'Accountability',
  },
  {
    id: 'status-3',
    content: 'Hosted a zero-proof dinner tonight. Everyone brought a ritual from their own journey and it hit deeper than we expected.',
    timeAgo: 'Yesterday',
    likes: 219,
    comments: 33,
    tag: 'Community',
  },
];

const mockFollowers: MockSocialProfile[] = [
  {
    id: 'f-1',
    name: 'Kai Morgan',
    handle: '@kai.keepsgoing',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
    sobrietyDays: 426,
    statusSnippet: 'Morning gratitude circle live at 8am PT. Pull up.',
    mutualCount: 14,
    isOnline: true,
  },
  {
    id: 'f-2',
    name: 'Alana Rivers',
    handle: '@alanastillrising',
    avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&auto=format&fit=crop',
    sobrietyDays: 212,
    statusSnippet: 'New playlist for focus sessions just dropped 🎧',
    mutualCount: 9,
    isOnline: false,
  },
  {
    id: 'f-3',
    name: 'Jules Park',
    handle: '@julesreset',
    avatarUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop',
    sobrietyDays: 98,
    statusSnippet: 'Rewrote my start story tonight. Healing in plain sight.',
    mutualCount: 5,
    isOnline: true,
  },
];

const mockFollowing: MockSocialProfile[] = [
  {
    id: 'fo-1',
    name: 'Noah Flynn',
    handle: '@flynnforward',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
    sobrietyDays: 612,
    statusSnippet: 'First sober summer in Europe, writing it all down.',
    mutualCount: 22,
    isOnline: false,
  },
  {
    id: 'fo-2',
    name: 'Sienna Hale',
    handle: '@siennasober',
    avatarUrl: 'https://images.unsplash.com/photo-1542293787938-4d2226c6e239?q=80&w=400&auto=format&fit=crop',
    sobrietyDays: 154,
    statusSnippet: 'Four straight weeks of sunrise breathwork!',
    mutualCount: 11,
    isOnline: true,
  },
  {
    id: 'fo-3',
    name: 'Elias Carter',
    handle: '@cartelcollective',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop',
    sobrietyDays: 74,
    statusSnippet: 'Turning my relapse story into a workshop.',
    mutualCount: 4,
    isOnline: false,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tallies } = useTallies();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('tallies');
  const [postFilter, setPostFilter] = useState<PostFilter>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTalliesModal, setShowTalliesModal] = useState(false);
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [profilePhotos, setProfilePhotos] = useState<MockPhoto[]>(mockPhotos);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [selectedPost, setSelectedPost] = useState<MockPhoto | null>(null);
  const [isPostModalVisible, setIsPostModalVisible] = useState<boolean>(false);
  const [commentDraft, setCommentDraft] = useState<string>('');
  const { height: windowHeight } = useWindowDimensions();

  const modalImageHeight = useMemo(() => Math.min(windowHeight * 0.52, 420), [windowHeight]);
  const commentListMaxHeight = useMemo(() => Math.max(windowHeight * 0.28, 190), [windowHeight]);

  const totalTallies = tallies.length;
  const followerTotal = user?.followersCount ?? mockFollowers.length;
  const followingTotal = user?.followingCount ?? mockFollowing.length;

  const heroAvatar = useMemo(() => {
    if (user?.avatarUrl) {
      return user.avatarUrl;
    }
    return fallbackAvatar;
  }, [user?.avatarUrl]);

  const profileName = user?.name || 'Avery Harper';
  const profileHandle = user?.username ? `@${user.username}` : '@averyresets';
  const profileBio = user?.bio || 'Community host. Breathwork guide. Documenting a 312-day streak and the rituals that keep it alive.';

  const handleEditPhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Photo Upload', 'Photo upload from camera roll is currently supported on mobile devices only.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to select a photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfile({ avatarUrl: result.assets[0].uri });
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  const handleSaveBio = async () => {
    await updateProfile({ bio: editBio });
    setShowEditModal(false);
    Alert.alert('Success', 'Bio updated!');
  };

  const handleOpenPost = useCallback((post: MockPhoto) => {
    setSelectedPost(post);
    setCommentDraft('');
    setIsPostModalVisible(true);
  }, []);

  const handleClosePost = useCallback(() => {
    setIsPostModalVisible(false);
    setSelectedPost(null);
    setCommentDraft('');
  }, []);

  const handleToggleLike = useCallback((photoId: string) => {
    setLikedPosts(prev => {
      const currentlyLiked = prev[photoId] ?? false;
      const nextLiked = !currentlyLiked;
      setProfilePhotos(existing => existing.map(photo => {
        if (photo.id !== photoId) {
          return photo;
        }
        return { ...photo, likes: Math.max(0, photo.likes + (nextLiked ? 1 : -1)) };
      }));
      setSelectedPost(current => {
        if (!current || current.id !== photoId) {
          return current;
        }
        return { ...current, likes: Math.max(0, current.likes + (nextLiked ? 1 : -1)) };
      });
      return { ...prev, [photoId]: nextLiked };
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
      userName: profileName,
      avatarUrl: heroAvatar,
      text: trimmed,
      timeAgo: 'Just now',
    };
    setProfilePhotos(existing => existing.map(photo => {
      if (photo.id !== selectedPost.id) {
        return photo;
      }
      return { ...photo, comments: [newComment, ...photo.comments] };
    }));
    setSelectedPost(current => {
      if (!current) {
        return current;
      }
      return { ...current, comments: [newComment, ...current.comments] };
    });
    setCommentDraft('');
  }, [commentDraft, selectedPost, heroAvatar, profileName]);

  return (
    <View style={styles.container}>
      <View style={[styles.profileHeader, { paddingTop: insets.top + 20 }]}>        
        <View style={styles.profileTopRow}>
          <View style={styles.profileTopSpacer} />
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              console.log('Navigating to notifications from Profile');
              router.push('/notifications');
            }}
            activeOpacity={0.7}
            testID="profile-notifications-button"
          >
            <Bell size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.profilePicContainer}>
          <Image source={{ uri: heroAvatar }} style={styles.profilePicImage} />
          <TouchableOpacity
            style={styles.editPhotoButton}
            onPress={handleEditPhoto}
            activeOpacity={0.7}
            testID="edit-avatar-button"
          >
            <Camera size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{profileName}</Text>
        <Text style={styles.userHandle}>{profileHandle}</Text>
        <Text style={styles.userBio}>{profileBio}</Text>
        <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editBioButton} activeOpacity={0.7}>
          <Text style={styles.editBioText}>{user?.bio ? 'Edit Bio' : 'Update Bio'}</Text>
        </TouchableOpacity>

        <View style={styles.bubbleRow}>
          <TouchableOpacity
            testID="tally-bubble"
            style={[styles.bubble, activeTab === 'tallies' && styles.bubbleActive]}
            onPress={() => {
              setActiveTab('tallies');
              setShowTalliesModal(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.bubbleNumber, activeTab === 'tallies' && styles.bubbleNumberActive]}>
              {totalTallies}
            </Text>
            <Text style={[styles.bubbleLabel, activeTab === 'tallies' && styles.bubbleLabelActive]}>
              Tallies
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bubble, activeTab === 'followers' && styles.bubbleActive]}
            onPress={() => setActiveTab('followers')}
            activeOpacity={0.7}
          >
            <Text style={[styles.bubbleNumber, activeTab === 'followers' && styles.bubbleNumberActive]}>
              {followerTotal}
            </Text>
            <Text style={[styles.bubbleLabel, activeTab === 'followers' && styles.bubbleLabelActive]}>
              Followers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bubble, activeTab === 'following' && styles.bubbleActive]}
            onPress={() => setActiveTab('following')}
            activeOpacity={0.7}
          >
            <Text style={[styles.bubbleNumber, activeTab === 'following' && styles.bubbleNumberActive]}>
              {followingTotal}
            </Text>
            <Text style={[styles.bubbleLabel, activeTab === 'following' && styles.bubbleLabelActive]}>
              Following
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {activeTab === 'tallies' && (
        <View style={styles.postToggleBar}>
          <TouchableOpacity
            style={[styles.toggleButton, postFilter === 'posts' && styles.toggleButtonActive]}
            onPress={() => setPostFilter('posts')}
            activeOpacity={0.7}
            testID="posts-filter"
          >
            <Text style={[styles.toggleButtonText, postFilter === 'posts' && styles.toggleButtonTextActive]}>
              🖼️ Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, postFilter === 'statuses' && styles.toggleButtonActive]}
            onPress={() => setPostFilter('statuses')}
            activeOpacity={0.7}
            testID="statuses-filter"
          >
            <Text style={[styles.toggleButtonText, postFilter === 'statuses' && styles.toggleButtonTextActive]}>
              📝 Statuses
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'tallies' && postFilter === 'posts' && (
          <View style={styles.section}>
            <View style={styles.instagramGrid} testID="photo-grid">
              {profilePhotos.map((item) => (
                <TouchableOpacity
                  key={`post-${item.id}`}
                  style={styles.gridItem}
                  activeOpacity={0.85}
                  onPress={() => handleOpenPost(item)}
                  testID={`post-thumbnail-${item.id}`}
                >
                  <Image source={{ uri: item.imageUrl }} style={styles.gridImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'tallies' && postFilter === 'statuses' && (
          <View style={styles.section}>
            <View style={styles.postsGrid} testID="status-feed">
              {mockStatuses.map((status) => (
                <View key={status.id} style={styles.statusCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.postHeaderLeft}>
                      <Image source={{ uri: heroAvatar }} style={styles.postAvatarImage} />
                      <View>
                        <Text style={styles.postUserName}>{profileName}</Text>
                        <Text style={styles.postTime}>{status.timeAgo}</Text>
                      </View>
                    </View>
                    <View style={styles.statusTag}>
                      <Text style={styles.statusTagText}>{status.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.postContent}>
                    {status.content}
                  </Text>
                  <View style={styles.postActions}>
                    <View style={styles.postAction}>
                      <Heart size={18} color={Colors.textSecondary} />
                      <Text style={styles.postActionText}>{status.likes}</Text>
                    </View>
                    <View style={styles.postAction}>
                      <MessageSquare size={18} color={Colors.textSecondary} />
                      <Text style={styles.postActionText}>{status.comments}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'followers' && (
          <View style={styles.section}>
            <View style={styles.socialList} testID="followers-list">
              {mockFollowers.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={styles.socialCard}
                  activeOpacity={0.75}
                  onPress={() => console.log('Navigate to profile', profile.handle)}
                >
                  <View style={styles.socialLeft}>
                    <View style={styles.socialAvatarContainer}>
                      <Image source={{ uri: profile.avatarUrl }} style={styles.socialAvatar} />
                      {profile.isOnline && <View style={styles.onlineDot} />}
                    </View>
                    <View style={styles.socialInfo}>
                      <Text style={styles.socialName}>{profile.name}</Text>
                      <Text style={styles.socialHandle}>{profile.handle}</Text>
                      <Text style={styles.socialSnippet}>{profile.statusSnippet}</Text>
                    </View>
                  </View>
                  <View style={styles.socialRight}>
                    <Text style={styles.socialMetric}>{profile.sobrietyDays}d</Text>
                    <Text style={styles.socialMetricLabel}>sober</Text>
                    <Text style={styles.socialMutual}>{profile.mutualCount} mutual</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'following' && (
          <View style={styles.section}>
            <View style={styles.socialList} testID="following-list">
              {mockFollowing.map((profile) => (
                <TouchableOpacity
                  key={profile.id}
                  style={styles.socialCard}
                  activeOpacity={0.75}
                  onPress={() => console.log('Navigate to profile', profile.handle)}
                >
                  <View style={styles.socialLeft}>
                    <View style={styles.socialAvatarContainer}>
                      <Image source={{ uri: profile.avatarUrl }} style={styles.socialAvatar} />
                      {profile.isOnline && <View style={styles.onlineDot} />}
                    </View>
                    <View style={styles.socialInfo}>
                      <Text style={styles.socialName}>{profile.name}</Text>
                      <Text style={styles.socialHandle}>{profile.handle}</Text>
                      <Text style={styles.socialSnippet}>{profile.statusSnippet}</Text>
                    </View>
                  </View>
                  <View style={styles.socialRight}>
                    <Text style={styles.socialMetric}>{profile.sobrietyDays}d</Text>
                    <Text style={styles.socialMetricLabel}>sober</Text>
                    <Text style={styles.socialMutual}>{profile.mutualCount} mutual</Text>
                  </View>
                </TouchableOpacity>
              ))}
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
        <View style={[styles.postModalOverlay, { paddingTop: insets.top * 0.25 }]}>
          <View style={[styles.postModalContent, { paddingBottom: insets.bottom + 24 }]}>
            <View style={[styles.postModalHeader, { paddingTop: insets.top + 12 }]}>
              <View style={styles.postModalHeaderLeft}>
                <TouchableOpacity
                  onPress={handleClosePost}
                  activeOpacity={0.7}
                  style={styles.postModalBackButton}
                  testID="back-post-modal"
                >
                  <ArrowLeft size={22} color={Colors.text} />
                  <Text style={styles.postModalBackText}>Back</Text>
                </TouchableOpacity>
                <Image source={{ uri: heroAvatar }} style={styles.modalAvatar} />
                <View>
                  <Text style={styles.modalUserName}>{profileName}</Text>
                  <Text style={styles.modalMeta}>{selectedPost?.postedAt}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleClosePost} activeOpacity={0.7} testID="close-post-modal">
                <X size={26} color={Colors.text} />
              </TouchableOpacity>
            </View>
            {selectedPost && (
              <>
                <Image
                  source={{ uri: selectedPost.imageUrl }}
                  style={[styles.postModalImage, { height: modalImageHeight }]}
                  resizeMode="cover"
                />
                <View style={[styles.postModalInfo, { paddingBottom: insets.bottom + 12 }]}>
                  <Text style={styles.postModalCaption}>{selectedPost.caption}</Text>
                  <View style={styles.postMetaRow}>
                    <TouchableOpacity
                      style={[styles.likeButton, likedPosts[selectedPost.id] && styles.likeButtonActive]}
                      onPress={() => handleToggleLike(selectedPost.id)}
                      activeOpacity={0.75}
                      testID="like-toggle-button"
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
                    style={[styles.commentList, { maxHeight: commentListMaxHeight }]}
                    contentContainerStyle={styles.commentListContent}
                    showsVerticalScrollIndicator={false}
                    testID="comment-list"
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
                    <Image source={{ uri: heroAvatar }} style={styles.commentAvatarSmall} />
                    <TextInput
                      value={commentDraft}
                      onChangeText={setCommentDraft}
                      placeholder="Add a comment..."
                      placeholderTextColor={Colors.textTertiary}
                      style={styles.commentInput}
                      returnKeyType="send"
                      onSubmitEditing={handleAddComment}
                      testID="comment-input"
                    />
                    <TouchableOpacity
                      onPress={handleAddComment}
                      activeOpacity={0.7}
                      style={styles.commentSendButton}
                      testID="submit-comment-button"
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
          <View style={[styles.modalContent, styles.tallyModalContainer]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tracked Tallies</Text>
              <TouchableOpacity onPress={() => setShowTalliesModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView
              testID="tally-modal"
              style={styles.tallyScroll}
              contentContainerStyle={styles.tallyScrollContent}
            >
              {tallies.length > 0 ? (
                tallies.map((tally, index) => {
                  const { totalDays, hours, minutes, seconds } = calculateTimeElapsed(tally.startDate);
                  const categoryOption = getCategoryOption(tally.category, tally.subcategory);
                  const displayName = tally.customName ?? tally.title ?? categoryOption.label;
                  const elapsedLabel = `${totalDays}d ${hours}h ${minutes}m ${seconds}s`;
                  const startedAt = new Date(tally.startDate);
                  const startedAtLabel = startedAt.toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <View
                      key={tally.id}
                      style={[
                        styles.tallyItem,
                        index === tallies.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.tallyItemLeft}>
                        <View style={[styles.tallyIconContainer, { backgroundColor: categoryOption.color }]}>
                          <Text style={styles.tallyIcon}>{categoryOption.emoji}</Text>
                        </View>
                        <View style={styles.tallyInfo}>
                          <View style={styles.tallyNameRow}>
                            <Text style={styles.tallyName} numberOfLines={1}>{displayName}</Text>
                            <Text style={styles.tallySeparator}>•</Text>
                            <Text style={styles.tallyTime}>{elapsedLabel}</Text>
                          </View>
                          <Text style={styles.tallyTimestamp} numberOfLines={1}>
                            Started {startedAtLabel}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyEmoji}>🎯</Text>
                  <Text style={styles.emptyTitle}>No Tallies Yet</Text>
                  <Text style={styles.emptyText}>
                    Start tracking your journey by adding a tally from the Home tab!
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Bio</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.bioInput}
              placeholder="Tell others about yourself..."
              placeholderTextColor={Colors.textTertiary}
              value={editBio}
              onChangeText={setEditBio}
              multiline
              maxLength={150}
              testID="bio-input"
            />
            <Text style={styles.charCount}>{editBio.length}/150</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setEditBio(user?.bio || '');
                  setShowEditModal(false);
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleSaveBio}
              >
                <Text style={styles.modalButtonTextConfirm}>Save</Text>
              </TouchableOpacity>
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
  profileHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 12,
  },
  profileTopSpacer: {
    flex: 1,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePicImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.white,
    backgroundColor: Colors.primary,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  userHandle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  userBio: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
    lineHeight: 22,
  },
  editBioButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
  },
  editBioText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  bubbleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
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
    paddingBottom: 120,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  instagramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
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
  postsGrid: {
    gap: 16,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#04040F',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
  },
  postUserName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.backgroundSecondary,
  },
  statusTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700' as const,
  },
  postContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  socialList: {
    gap: 16,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: Colors.white,
    borderRadius: 18,
    shadowColor: '#04040F',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  socialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  socialAvatarContainer: {
    position: 'relative',
  },
  socialAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  socialInfo: {
    flex: 1,
    gap: 4,
  },
  socialName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  socialHandle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  socialSnippet: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  socialRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  socialMetric: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  socialMetricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  socialMutual: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  emptySection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tallyModalContainer: {
    maxHeight: '80%',
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
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  tallyScroll: {
    maxHeight: 360,
  },
  tallyScrollContent: {
    paddingBottom: 24,
  },
  tallyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tallyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tallyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tallyIcon: {
    fontSize: 24,
  },
  tallyInfo: {
    flex: 1,
    gap: 6,
  },
  tallyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tallyName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tallySeparator: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  tallyTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '700' as const,
  },
  tallyTimestamp: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  bioInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.backgroundSecondary,
  },
  modalButtonConfirm: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
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
    overflow: 'hidden',
    width: '100%',
    maxHeight: '92%',
  },
  postModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 18,
  },
  postModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexShrink: 1,
  },
  postModalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
  },
  postModalBackText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
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
  },
  postModalInfo: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 18,
    flexGrow: 1,
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
    flexGrow: 1,
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
