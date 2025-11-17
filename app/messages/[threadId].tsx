import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pin, Send } from 'lucide-react-native';
import Colors from '../../constants/colors';
import BackButton from '../../components/BackButton';
import { MessageThread, messageThreads, ThreadMessage } from '../../mocks/messages';

function normalizeParam(input: string | string[] | undefined): string | undefined {
  if (!input) {
    return undefined;
  }
  return Array.isArray(input) ? input[0] : input;
}

function useThread(): MessageThread | undefined {
  const params = useLocalSearchParams<{ threadId?: string | string[] }>();
  const threadId = useMemo(() => normalizeParam(params.threadId), [params.threadId]);

  return useMemo(
    () => messageThreads.find((thread) => thread.id === threadId),
    [threadId],
  );
}

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isMine = message.author === 'me';

  return (
    <View
      testID={`conversation-message-${message.id}`}
      style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}
    >
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.messageMine : styles.messageTheirs,
          message.isPinned ? styles.messagePinned : null,
        ]}
      >
        {message.isPinned ? (
          <View style={styles.pinnedLabel}>
            <Pin size={14} color={Colors.white} />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        ) : null}
        <Text style={[styles.messageText, isMine ? styles.messageTextMine : styles.messageTextTheirs]}>
          {message.text}
        </Text>
        <Text style={[styles.messageTimestamp, isMine ? styles.timestampMine : styles.timestampTheirs]}>
          {message.timestamp}
        </Text>
      </View>
    </View>
  );
}

export default function ThreadScreen() {
  const insets = useSafeAreaInsets();
  const thread = useThread();
  const [draft, setDraft] = useState<string>('');

  const placeholderThread = useMemo(() => messageThreads[0], []);
  const activeThread = thread ?? placeholderThread;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <BackButton testID="thread-back-button" color={Colors.white} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{activeThread.name}</Text>
            <Text style={styles.headerHandle}>@{activeThread.handle}</Text>
          </View>
          <View style={styles.headerAvatarWrapper}>
            <Image source={{ uri: activeThread.avatarUrl }} style={styles.headerAvatar} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.threadMeta}>
          <Text style={styles.threadMetaTitle}>Today</Text>
          {thread ? null : (
            <Text style={styles.threadMetaCaption}>
              Thread not found. Showing Aurora Habits Circle as a preview.
            </Text>
          )}
        </View>
        {activeThread.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      <View
        style={[styles.composerContainer, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}
      >
        <View style={styles.composerInner}>
          <TextInput
            testID="thread-input"
            value={draft}
            onChangeText={setDraft}
            placeholder="Send encouragement, reflections, or a quick check-in"
            placeholderTextColor={Colors.textTertiary}
            multiline
            style={styles.composerInput}
          />
          <TouchableOpacity
            testID="thread-send-button"
            style={[styles.sendButton, draft.trim() ? styles.sendButtonActive : null]}
            activeOpacity={0.75}
            onPress={() => {
              const text = draft.trim();
              if (!text) {
                console.log('Send pressed without text');
                return;
              }
              console.log(`Sending message to ${activeThread.id}: ${text}`);
              setDraft('');
            }}
          >
            <Send size={20} color={draft.trim() ? Colors.white : Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {Platform.OS === 'web' ? <View style={{ height: 12 }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerInfo: {
    flex: 1,
    gap: 6,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  headerHandle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600' as const,
  },
  headerAvatarWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  headerAvatar: {
    width: '100%',
    height: '100%',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 18,
  },
  threadMeta: {
    alignItems: 'center',
    gap: 6,
  },
  threadMetaTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: Colors.textSecondary,
  },
  threadMetaCaption: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowMine: {
    justifyContent: 'flex-end',
  },
  bubbleRowTheirs: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  messageMine: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 8,
  },
  messageTheirs: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 8,
  },
  messagePinned: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextMine: {
    color: Colors.white,
    fontWeight: '600' as const,
  },
  messageTextTheirs: {
    color: Colors.text,
  },
  messageTimestamp: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  timestampMine: {
    color: 'rgba(255,255,255,0.8)',
    alignSelf: 'flex-end',
  },
  timestampTheirs: {
    color: Colors.textTertiary,
    alignSelf: 'flex-start',
  },
  pinnedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  pinnedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  composerContainer: {
    paddingHorizontal: 16,
  },
  composerInner: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: 'rgba(15,23,42,0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 7,
  },
  composerInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
