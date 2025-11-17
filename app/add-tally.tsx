import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Calendar } from 'lucide-react-native';
import BackButton from '../components/BackButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../constants/colors';
import { SOBRIETY_OPTIONS, LIFE_EVENT_OPTIONS } from '../constants/tallies';
import { TallyCategory, TallyType } from '../types/tally';
import { useTallies } from '../contexts/tallies';

type Step = 'type' | 'category' | 'details';

export default function AddTallyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addTally } = useTallies();

  const [step, setStep] = useState<Step>('type');
  const [tallyType, setTallyType] = useState<TallyType>('sobriety');
  const [category, setCategory] = useState<TallyCategory | null>(null);
  const [customName, setCustomName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dailyCost, setDailyCost] = useState('');
  const [reason, setReason] = useState('');

  const handleTypeSelect = (type: TallyType) => {
    setTallyType(type);
    setStep('category');
  };

  const handleCategorySelect = (cat: TallyCategory) => {
    setCategory(cat);
    setStep('details');
  };

  const handleFinish = async () => {
    if (!category) return;

    await addTally({
      type: tallyType,
      category,
      customName: customName.trim() || undefined,
      startDate: startDate.getTime(),
      dailyCost: parseFloat(dailyCost) || 0,
      reason: reason.trim() || undefined,
      tags: [],
    });

    router.replace('/home');
  };

  const categories = tallyType === 'sobriety' ? SOBRIETY_OPTIONS : LIFE_EVENT_OPTIONS;
  const selectedOption = category ? categories.find(opt => opt.value === category) : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <BackButton color={Colors.text} style={styles.closeButton} testID="add-tally-back" />
        <Text style={styles.headerTitle}>
          {step === 'type' && 'Choose Type'}
          {step === 'category' && 'What are you tracking?'}
          {step === 'details' && 'Setup Details'}
        </Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {step === 'type' && (
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => handleTypeSelect('sobriety')}
              activeOpacity={0.7}
            >
              <Text style={styles.typeEmoji}>🎯</Text>
              <Text style={styles.typeTitle}>Sobriety</Text>
              <Text style={styles.typeSubtitle}>Track your journey to a healthier life</Text>
              <View style={styles.typeArrow}>
                <ChevronRight size={24} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCard}
              onPress={() => handleTypeSelect('life-event')}
              activeOpacity={0.7}
            >
              <Text style={styles.typeEmoji}>✨</Text>
              <Text style={styles.typeTitle}>Life Events & Habits</Text>
              <Text style={styles.typeSubtitle}>Track positive changes and milestones</Text>
              <View style={styles.typeArrow}>
                <ChevronRight size={24} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {step === 'category' && (
          <View style={styles.categoryContainer}>
            {categories.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.categoryCard, { borderColor: option.color }]}
                onPress={() => handleCategorySelect(option.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.categoryEmoji}>{option.icon}</Text>
                <Text style={styles.categoryLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'details' && selectedOption && (
          <View style={styles.detailsContainer}>
            <View style={[styles.selectedBadge, { backgroundColor: selectedOption.color }]}>
              <Text style={styles.selectedEmoji}>{selectedOption.icon}</Text>
              <Text style={styles.selectedLabel}>{selectedOption.label}</Text>
            </View>

            {(category === 'other-sobriety' || category === 'other-life') && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Custom Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What are you tracking?"
                  placeholderTextColor={Colors.textTertiary}
                  value={customName}
                  onChangeText={setCustomName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>When did this journey start?</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) setStartDate(date);
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Daily cost before (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="$0"
                placeholderTextColor={Colors.textTertiary}
                value={dailyCost}
                onChangeText={setDailyCost}
                keyboardType="decimal-pad"
              />
              <Text style={styles.hint}>Calculate how much money you’re saving</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Why are you tracking this? (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Share your motivation..."
                placeholderTextColor={Colors.textTertiary}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.finishButton, { backgroundColor: selectedOption.color }]}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.finishButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  typeContainer: {
    gap: 16,
  },
  typeCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    position: 'relative',
  },
  typeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  typeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  typeSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  typeArrow: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  categoryEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  detailsContainer: {
    gap: 24,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  selectedEmoji: {
    fontSize: 32,
  },
  selectedLabel: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  hint: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  finishButton: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
