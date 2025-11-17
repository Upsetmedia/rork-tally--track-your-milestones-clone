import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ImageIcon, Plus, Check, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTallies } from '@/contexts/tallies';
import { getCategoryOption } from '@/constants/tallies';

type PostType = 'text' | 'photo';

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tallies } = useTallies();

  const [postType, setPostType] = useState<PostType>('text');
  const [content, setContent] = useState('');
  const [selectedTallyId, setSelectedTallyId] = useState<string>('none');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [postAnonymously, setPostAnonymously] = useState<boolean>(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to upload photos.'
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handlePost = () => {
    if (postType === 'text' && !content.trim()) {
      Alert.alert('Error', 'Please write something to share');
      return;
    }

    if (postType === 'photo' && !selectedImage) {
      Alert.alert('Error', 'Please select a photo to share');
      return;
    }

    if (!selectedTallyId) {
      Alert.alert('Error', 'Please select a tally category');
      return;
    }

    console.log('Submitting community post', {
      postType,
      contentLength: content.length,
      selectedTallyId,
      postAnonymously,
      hasSelectedImage: Boolean(selectedImage),
    });

    const postTypeLabel = postType === 'text' ? 'Status' : 'Photo';
    Alert.alert(
      'Success',
      `Your ${postTypeLabel} has been shared${postAnonymously ? ' anonymously' : ''}!`,
      [
      {
        text: 'OK',
        onPress: () => {
          setContent('');
          setSelectedTallyId('none');
          setPostType('text');
          setSelectedImage(null);
          setPostAnonymously(false);
        },
      },
    ]);
  };

  const tallyOptions = [
    { id: 'none', icon: '•', label: 'None', color: Colors.border },
    ...tallies.map((tally) => {
      const option = getCategoryOption(tally.category);
      return {
        id: tally.id,
        icon: option?.icon || '⭐',
        label: tally.customName || option?.label || tally.category,
        color: option?.color || Colors.primary,
      };
    }),
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.logo}>Tally</Text>
        <Text style={styles.subtitle}>Share your journey</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.postTypeSection}>
          <Text style={styles.sectionTitle}>Post Type</Text>
          <View style={styles.postTypeToggle}>
            <TouchableOpacity
              style={[
                styles.postTypeButton,
                postType === 'text' && styles.postTypeButtonActive,
              ]}
              onPress={() => setPostType('text')}
              activeOpacity={0.7}
            >
              <MessageSquare
                size={20}
                color={postType === 'text' ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.postTypeButtonText,
                  postType === 'text' && styles.postTypeButtonTextActive,
                ]}
              >
                Status
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postTypeButton,
                postType === 'photo' && styles.postTypeButtonActive,
              ]}
              onPress={() => setPostType('photo')}
              activeOpacity={0.7}
            >
              <ImageIcon
                size={20}
                color={postType === 'photo' ? Colors.white : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.postTypeButtonText,
                  postType === 'photo' && styles.postTypeButtonTextActive,
                ]}
              >
                Photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Tally Category *</Text>
          <View style={styles.talliesGrid}>
            {tallyOptions.map((option) => {
              const isSelected = selectedTallyId === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.tallyChip,
                    isSelected && styles.tallyChipSelected,
                    { borderColor: option.color },
                  ]}
                  onPress={() => setSelectedTallyId(option.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tallyChipIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.tallyChipText,
                      isSelected && styles.tallyChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Check size={12} color={Colors.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.toggleSection}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleTitle}>Post Anonymously</Text>
            <Text style={styles.toggleSubtitle}>
              Let the community support you without revealing your name.
            </Text>
          </View>
          <Switch
            value={postAnonymously}
            onValueChange={setPostAnonymously}
            thumbColor={postAnonymously ? Colors.primary : Colors.white}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            ios_backgroundColor={Colors.border}
            testID="anonymous-post-switch"
          />
        </View>

        {postType === 'text' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Status</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="What's on your mind? Share your progress or feelings..."
              placeholderTextColor={Colors.textTertiary}
              value={content}
              onChangeText={setContent}
              maxLength={500}
            />
            <Text style={styles.charCount}>{content.length}/500</Text>
          </View>
        )}

        {postType === 'photo' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upload Photo</Text>
            {!selectedImage ? (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={pickImage}
                activeOpacity={0.7}
              >
                <ImageIcon size={48} color={Colors.primary} />
                <Text style={styles.uploadTitle}>Tap to Select Photo</Text>
                <Text style={styles.uploadText}>
                  Choose from your camera roll
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={18} color={Colors.white} />
                  <Text style={styles.changeImageText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              style={styles.captionInput}
              multiline
              placeholder="Add a caption (optional)..."
              placeholderTextColor={Colors.textTertiary}
              value={content}
              onChangeText={setContent}
              maxLength={300}
            />
            <Text style={styles.charCount}>{content.length}/300</Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            ((postType === 'text' && !content.trim()) ||
              (postType === 'photo' && !selectedImage)) &&
              styles.primaryButtonDisabled,
          ]}
          onPress={handlePost}
          activeOpacity={0.7}
          disabled={
            (postType === 'text' && !content.trim()) ||
            (postType === 'photo' && !selectedImage)
          }
        >
          <Check size={20} color={Colors.white} />
          <Text style={styles.primaryButtonText}>
            {postType === 'photo' ? 'Share Photo' : 'Share Status'}
          </Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  postTypeSection: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  postTypeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  postTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  postTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  postTypeButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  postTypeButtonTextActive: {
    color: Colors.white,
  },
  talliesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tallyChip: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    minWidth: '47%',
  },
  tallyChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tallyChipIcon: {
    fontSize: 20,
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
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 24,
  },
  toggleContent: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 140,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  uploadBox: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  imagePreview: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.backgroundSecondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '400' as const,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    padding: 12,
  },
  changeImageText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  captionInput: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
});
