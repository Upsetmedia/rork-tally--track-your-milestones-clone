import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ImageIcon, Plus, Check } from 'lucide-react-native';
import BackButton from '../components/BackButton';
import Colors from '../constants/colors';
import { useTallies } from '../contexts/tallies';
import { getCategoryOption } from '../constants/tallies';

export default function CreatePostScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tallies } = useTallies();

  const [content, setContent] = useState('');
  const [selectedTallyId, setSelectedTallyId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something to share');
      return;
    }

    Alert.alert('Success', 'Your post has been shared!', [
      {
        text: 'OK',
        onPress: () => router.back(),
      },
    ]);
  };

  const handleAddTally = () => {
    router.push('/add-tally');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerContent}>
          <BackButton
            color={Colors.white}
            style={styles.closeButton}
            testID="create-post-back"
          />
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            style={styles.postButton}
            onPress={handlePost}
            activeOpacity={0.7}
          >
            <Check size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What&apos;s on your mind?</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Share your progress, thoughts, or milestones..."
            placeholderTextColor={Colors.textTertiary}
            value={content}
            onChangeText={setContent}
            maxLength={500}
          />
          <Text style={styles.charCount}>{content.length}/500</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attach Tally (Optional)</Text>
          {tallies.length === 0 ? (
            <TouchableOpacity
              style={styles.addTallyButton}
              onPress={handleAddTally}
              activeOpacity={0.7}
            >
              <Plus size={24} color={Colors.primary} />
              <Text style={styles.addTallyText}>Create Your First Tally</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.talliesGrid}>
              {tallies.map((tally) => {
                const option = getCategoryOption(tally.category);
                const displayName = tally.customName || option?.label || tally.category;
                const isSelected = selectedTallyId === tally.id;

                return (
                  <TouchableOpacity
                    key={tally.id}
                    style={[
                      styles.tallyChip,
                      isSelected && styles.tallyChipSelected,
                      { borderColor: option?.color || Colors.primary },
                    ]}
                    onPress={() =>
                      setSelectedTallyId(isSelected ? null : tally.id)
                    }
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tallyChipIcon}>{option?.icon || '⭐'}</Text>
                    <Text
                      style={[
                        styles.tallyChipText,
                        isSelected && styles.tallyChipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {displayName}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkMark}>
                        <Check size={14} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo (Coming Soon)</Text>
          <TouchableOpacity
            style={styles.photoPlaceholder}
            activeOpacity={0.7}
            disabled
          >
            <ImageIcon size={32} color={Colors.textTertiary} />
            <Text style={styles.photoPlaceholderText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.visibilityToggle}
            onPress={() => setIsPublic(!isPublic)}
            activeOpacity={0.7}
          >
            <View style={styles.visibilityInfo}>
              <Text style={styles.visibilityTitle}>
                {isPublic ? 'Public' : 'Private'}
              </Text>
              <Text style={styles.visibilityDescription}>
                {isPublic
                  ? 'Anyone can see this post'
                  : 'Only you can see this post'}
              </Text>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                isPublic && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  isPublic && styles.toggleKnobActive,
                ]}
              />
            </View>
          </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  postButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 140,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
  addTallyButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addTallyText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  talliesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tallyChip: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    maxWidth: '48%',
  },
  tallyChipSelected: {
    backgroundColor: Colors.primary,
  },
  tallyChipIcon: {
    fontSize: 18,
  },
  tallyChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    flex: 1,
  },
  tallyChipTextSelected: {
    color: Colors.white,
  },
  checkMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  photoPlaceholderText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
  },
  visibilityToggle: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  visibilityInfo: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  visibilityDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  toggleSwitch: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    padding: 3,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.success,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: {
    transform: [{ translateX: 24 }],
  },
});
