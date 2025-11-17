import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, MessageCircle, Pin, ChevronRight, Search, Users, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '../../constants/colors';
import { mockUsers } from '../../mocks/community';
import { messageThreads } from '../../mocks/messages';


export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return mockUsers
      .filter((user) => {
        const nameMatch = user.name.toLowerCase().includes(query);
        const usernameMatch = user.username.toLowerCase().includes(query);
        return nameMatch || usernameMatch;
      })
      .slice(0, 12);
  }, [searchQuery]);

  const hasQuery = searchQuery.trim().length > 0;

  const handleOpenConversation = useCallback((userId: string) => {
    console.log(`Opening conversation with user ${userId}`);
  }, []);

  const handleOpenThread = useCallback(
    (threadId: string) => {
      console.log(`Navigating to thread ${threadId}`);
      router.push({ pathname: '/messages/[threadId]', params: { threadId } });
    },
    [router],
  );

  const handleOpenCommunityExplorer = useCallback(() => {
    console.log('Navigating to community explorer');
    router.push('/community-explorer');
  }, [router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.logo}>Messages</Text>
        <Text style={styles.subtitle}>Connect with your support community</Text>
      </LinearGradient>

      <ScrollView
        style={styles.conversationsContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.textTertiary} />
            <TextInput
              testID="messages-search-input"
              style={styles.searchInput}
              placeholder="Search friends & followers"
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={Colors.primary}
              returnKeyType="search"
            />
            {hasQuery && (
              <TouchableOpacity
                testID="messages-search-clear"
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
                activeOpacity={0.6}
              >
                <X size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.searchHint}>Search your network to start a conversation</Text>
        </View>

        <View style={styles.primaryCardsContainer}>
          <TouchableOpacity
            style={styles.primaryCardRow}
            onPress={() => router.push('/ai-chat')}
            activeOpacity={0.7}
          >
            <View style={styles.conversationLeft}>
              <View style={styles.aiAvatarContainer}>
                <LinearGradient
                  colors={[Colors.gradient1, Colors.gradient2]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.aiAvatar}
                >
                  <Bot size={24} color={Colors.white} />
                </LinearGradient>
              </View>
              <View style={styles.conversationInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.conversationName}>AI Assistant</Text>
                  <Pin size={14} color={Colors.primary} style={styles.pinIcon} />
                </View>
                <Text style={styles.conversationPreview}>
                  I’m here to help you stay on track
                </Text>
              </View>
            </View>
            <View style={styles.cardCaret}>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <View style={styles.primaryDivider} />

          <TouchableOpacity
            testID="join-community-card"
            style={styles.primaryCardRow}
            onPress={handleOpenCommunityExplorer}
            activeOpacity={0.75}
          >
            <View style={styles.conversationLeft}>
              <View style={styles.communityAvatar}>
                <Users size={22} color={Colors.white} />
              </View>
              <View style={styles.conversationInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.conversationName}>Communities</Text>
                </View>
                <Text style={styles.conversationPreview}>
                  Explore accountability pods and aligned circles
                </Text>
              </View>
            </View>
            <View style={styles.cardCaret}>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Direct Messages</Text>
        </View>

        {hasQuery ? (
          filteredUsers.length > 0 ? (
            <View style={styles.searchResultsList}>
              {filteredUsers.map((user) => (
                <TouchableOpacity
                  testID={`messages-search-result-${user.id}`}
                  key={user.id}
                  style={styles.searchResultItem}
                  onPress={() => handleOpenConversation(user.id)}
                  activeOpacity={0.75}
                >
                  <Image source={{ uri: user.avatarUrl }} style={styles.searchResultAvatar} />
                  <View style={styles.searchResultContent}>
                    <Text style={styles.searchResultName}>{user.name}</Text>
                    <Text style={styles.searchResultUsername}>@{user.username}</Text>
                  </View>
                  <View style={styles.searchResultAction}>
                    <MessageCircle size={18} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.searchEmptyState}>
              <Search size={34} color={Colors.textTertiary} />
              <Text style={styles.searchEmptyTitle}>No matches found</Text>
              <Text style={styles.searchEmptyDescription}>
                Try another name or username to start a new conversation.
              </Text>
            </View>
          )
        ) : (
          <View style={styles.threadList}>
            {messageThreads.map((thread) => {
              const isUnread = thread.unreadCount > 0;

              return (
                <TouchableOpacity
                  testID={`message-thread-${thread.id}`}
                  key={thread.id}
                  style={[
                    styles.threadRow,
                    isUnread ? styles.threadRowUnread : styles.threadRowRead,
                  ]}
                  onPress={() => handleOpenThread(thread.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.threadAvatarWrapper}>
                    <Image source={{ uri: thread.avatarUrl }} style={styles.threadAvatar} />
                  </View>
                  <View style={styles.threadContent}>
                    <View style={styles.threadTopRow}>
                      <Text
                        style={[
                          styles.threadName,
                          isUnread ? styles.threadNameUnread : styles.threadNameRead,
                        ]}
                        numberOfLines={1}
                      >
                        {thread.name}
                      </Text>
                      <Text style={styles.threadTimestamp}>{thread.timestamp}</Text>
                    </View>
                    <View style={styles.threadBottomRow}>
                      <Text
                        style={[
                          styles.threadPreview,
                          isUnread ? styles.threadPreviewUnread : styles.threadPreviewRead,
                        ]}
                        numberOfLines={1}
                      >
                        @{thread.handle} · {thread.preview}
                      </Text>
                      {isUnread ? (
                        <View style={styles.unreadCountBadge}>
                          <Text style={styles.unreadCountText}>{thread.unreadCount}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
    fontSize: 28,
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
  conversationsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
    gap: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  searchHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    paddingHorizontal: 4,
  },
  primaryCardsContainer: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: 'rgba(15,23,42,0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 7,
  },
  primaryCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 96,
  },
  primaryDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  cardCaret: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  communityAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,102,241,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
  },
  conversationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  aiAvatarContainer: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  aiAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  pinIcon: {
    marginLeft: 2,
  },
  conversationPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  supportGroupsList: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 8,
  },
  supportGroupCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  supportGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supportGroupIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  supportGroupTitles: {
    flex: 1,
    gap: 4,
  },
  supportGroupName: {
    fontSize: 17,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  supportGroupMeta: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  supportGroupFormat: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  supportGroupDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  searchResultsList: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchResultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
  },
  searchResultContent: {
    flex: 1,
    gap: 4,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  searchResultUsername: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  searchResultAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmptyState: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  searchEmptyTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  searchEmptyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  threadList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 0,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  threadRowUnread: {
    backgroundColor: '#EEF2FF',
  },
  threadRowRead: {
    backgroundColor: Colors.white,
  },
  threadAvatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  threadAvatar: {
    width: '100%',
    height: '100%',
  },
  threadContent: {
    flex: 1,
    gap: 6,
  },
  threadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  threadBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  threadName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  threadNameUnread: {
    color: Colors.text,
  },
  threadNameRead: {
    color: Colors.textSecondary,
  },
  threadTimestamp: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  threadPreview: {
    flex: 1,
    fontSize: 13,
  },
  threadPreviewUnread: {
    color: Colors.text,
    fontWeight: '600' as const,
  },
  threadPreviewRead: {
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  unreadCountBadge: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
  },
});
