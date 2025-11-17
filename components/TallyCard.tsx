import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent, DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getCategoryOption } from '../constants/tallies';
import Colors from '../constants/colors';
import { Tally } from '../types/tally';
import { calculateTimeElapsed, formatTime } from '../utils/tally';
import { ChevronRight, Settings, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTallies } from '../contexts/tallies';

interface TallyCardProps {
  tally: Tally;
}

export default function TallyCard({ tally }: TallyCardProps) {
  const router = useRouter();
  const { updateTally, deleteTally } = useTallies();
  const [time, setTime] = useState(calculateTimeElapsed(tally.startDate));
  const scaleAnim = useState(new Animated.Value(1))[0];
  const [editorVisible, setEditorVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(tally.startDate));
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [deleteErrorText, setDeleteErrorText] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTimeElapsed(tally.startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [tally.startDate]);

  useEffect(() => {
    setSelectedDate(new Date(tally.startDate));
  }, [tally.startDate]);

  const option = getCategoryOption(tally.category, tally.subcategory);
  const displayName = useMemo(
    () => tally.customName || option?.label || tally.category,
    [option?.label, tally.category, tally.customName],
  );

  const subtitle = useMemo(() => {
    if (tally.type === 'sobriety') {
      return 'Sobriety tracker';
    }
    if (tally.type === 'lifestyle') {
      return 'Lifestyle tracker';
    }
    return 'Habit tracker';
  }, [tally.type]);

  const formattedDate = useMemo(
    () => selectedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    [selectedDate],
  );

  const formattedTime = useMemo(
    () => selectedDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    [selectedDate],
  );

  const handlePressIn = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigateDetail = () => {
    console.log('TallyCard: navigating to detail', tally.id);
    router.push(`/tally-detail?id=${tally.id}`);
  };

  const handleOpenSettings = useCallback(() => {
    setErrorText(null);
    setDeleteErrorText(null);
    setConfirmingDelete(false);
    setIsDeleting(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setEditorVisible(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    if (isSaving || isDeleting) {
      return;
    }
    setEditorVisible(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setErrorText(null);
    setDeleteErrorText(null);
    setConfirmingDelete(false);
  }, [isDeleting, isSaving]);

  const handleAdjustDatePress = useCallback(() => {
    console.log('TallyCard: adjust date pressed', { tallyId: tally.id });
    setErrorText(null);
    setDeleteErrorText(null);
    setShowTimePicker(false);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (event, nextDate) => {
          if (event.type === 'dismissed' || !nextDate) {
            return;
          }
          console.log('TallyCard: android date selected', { tallyId: tally.id, iso: nextDate.toISOString() });
          setSelectedDate((prev) => {
            const updated = new Date(prev);
            updated.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
            return updated;
          });
        },
      });
      setShowDatePicker(false);
      return;
    }
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const defaultValue = selectedDate.toISOString().split('T')[0];
        const response = window.prompt('Enter new start date (YYYY-MM-DD)', defaultValue);
        if (!response) {
          return;
        }
        const trimmed = response.trim();
        const parts = trimmed.split('-');
        if (parts.length !== 3) {
          setErrorText('Enter date as YYYY-MM-DD.');
          return;
        }
        const [yearStr, monthStr, dayStr] = parts;
        const year = Number(yearStr);
        const month = Number(monthStr);
        const day = Number(dayStr);
        if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
          setErrorText('Enter date as YYYY-MM-DD.');
          return;
        }
        setSelectedDate((prev) => {
          const updated = new Date(prev);
          updated.setFullYear(year, month - 1, day);
          return updated;
        });
        console.log('TallyCard: web date selected', { tallyId: tally.id, value: trimmed });
      }
      setShowDatePicker(false);
      return;
    }
    setShowDatePicker(true);
  }, [selectedDate, tally.id]);

  const handleAdjustTimePress = useCallback(() => {
    console.log('TallyCard: adjust time pressed', { tallyId: tally.id });
    setErrorText(null);
    setDeleteErrorText(null);
    setShowDatePicker(false);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'time',
        is24Hour: false,
        onChange: (event, nextDate) => {
          if (event.type === 'dismissed' || !nextDate) {
            return;
          }
          console.log('TallyCard: android time selected', { tallyId: tally.id, iso: nextDate.toISOString() });
          setSelectedDate((prev) => {
            const updated = new Date(prev);
            updated.setHours(nextDate.getHours(), nextDate.getMinutes(), 0, 0);
            return updated;
          });
        },
      });
      setShowTimePicker(false);
      return;
    }
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        const defaultHours = selectedDate.getHours().toString().padStart(2, '0');
        const defaultMinutes = selectedDate.getMinutes().toString().padStart(2, '0');
        const response = window.prompt('Enter new start time (HH:MM)', `${defaultHours}:${defaultMinutes}`);
        if (!response) {
          return;
        }
        const trimmed = response.trim();
        const parts = trimmed.split(':');
        if (parts.length !== 2) {
          setErrorText('Enter time as HH:MM.');
          return;
        }
        const [hourStr, minuteStr] = parts;
        const hour = Number(hourStr);
        const minute = Number(minuteStr);
        if (
          Number.isNaN(hour) ||
          Number.isNaN(minute) ||
          hour < 0 ||
          hour > 23 ||
          minute < 0 ||
          minute > 59
        ) {
          setErrorText('Enter time as HH:MM.');
          return;
        }
        setSelectedDate((prev) => {
          const updated = new Date(prev);
          updated.setHours(hour, minute, 0, 0);
          return updated;
        });
        console.log('TallyCard: web time selected', { tallyId: tally.id, value: trimmed });
      }
      setShowTimePicker(false);
      return;
    }
    setShowTimePicker(true);
  }, [selectedDate, tally.id]);

  const handleDatePickerChange = useCallback(
    (event: DateTimePickerEvent, nextDate?: Date) => {
      if (event.type === 'dismissed') {
        setShowDatePicker(false);
        return;
      }
      if (nextDate) {
        const updated = new Date(selectedDate);
        updated.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
        setSelectedDate(updated);
      }
      if (Platform.OS !== 'ios') {
        setShowDatePicker(false);
      }
    },
    [selectedDate],
  );

  const handleTimePickerChange = useCallback(
    (event: DateTimePickerEvent, nextDate?: Date) => {
      if (event.type === 'dismissed') {
        setShowTimePicker(false);
        return;
      }
      if (nextDate) {
        const updated = new Date(selectedDate);
        updated.setHours(nextDate.getHours(), nextDate.getMinutes(), 0, 0);
        setSelectedDate(updated);
      }
      if (Platform.OS !== 'ios') {
        setShowTimePicker(false);
      }
    },
    [selectedDate],
  );

  const handleSaveStartDate = useCallback(async () => {
    if (isSaving || isDeleting) {
      return;
    }
    if (selectedDate.getTime() > Date.now()) {
      setErrorText('Start date cannot be in the future.');
      return;
    }
    setErrorText(null);
    const normalizedStart = new Date(selectedDate);
    normalizedStart.setSeconds(0, 0);
    console.log('TallyCard: saving start date', { tallyId: tally.id, iso: normalizedStart.toISOString() });
    setIsSaving(true);
    try {
      await updateTally(tally.id, { startDate: normalizedStart.getTime() });
      setSelectedDate(normalizedStart);
      setEditorVisible(false);
      setShowDatePicker(false);
      setShowTimePicker(false);
      console.log('TallyCard: start date updated', { tallyId: tally.id });
    } catch (error) {
      console.error('TallyCard: failed to update start date', error);
      setErrorText('Could not update start time. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [isDeleting, isSaving, selectedDate, tally.id, updateTally]);

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        testID={`tally-card-${tally.id}`}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.container}
        onPress={handleNavigateDetail}
      >
        <View style={styles.headerRow}>
          <View style={styles.leading}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{option?.icon || '⭐'}</Text>
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              testID={`tally-card-${tally.id}-settings-button`}
              style={styles.settingsButton}
              onPress={handleOpenSettings}
              activeOpacity={0.8}
            >
              <Settings size={18} color={Colors.white} />
            </TouchableOpacity>
            <ChevronRight size={22} color="rgba(49,46,129,0.5)" />
          </View>
        </View>
        <LinearGradient
          colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.12)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.timerBlock}
        >
          <Text style={styles.timeValue}>{formatTime(time.days, time.hours, time.minutes, time.seconds)}</Text>
          <Text style={styles.timeLabel}>Time clean</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={editorVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSettings}
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Adjust tracker start</Text>
            <Text style={styles.modalSubtitle}>Update the start date and time for this tracker.</Text>
            <View style={styles.currentValueBlock}>
              <Text style={styles.currentValueLabel}>Selected start</Text>
              <Text style={styles.currentValueValue}>{formattedDate}</Text>
              <Text style={styles.currentValueTime}>{formattedTime}</Text>
            </View>
            <View style={styles.pickerActions}>
              <TouchableOpacity
                testID={`tally-card-${tally.id}-edit-date-button`}
                style={styles.pickerTrigger}
                onPress={handleAdjustDatePress}
                activeOpacity={0.85}
              >
                <Text style={styles.pickerTriggerText}>Adjust date</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID={`tally-card-${tally.id}-edit-time-button`}
                style={styles.pickerTrigger}
                onPress={handleAdjustTimePress}
                activeOpacity={0.85}
              >
                <Text style={styles.pickerTriggerText}>Adjust time</Text>
              </TouchableOpacity>
            </View>
            {showDatePicker ? (
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDatePickerChange}
                  themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
                  maximumDate={new Date()}
                />
              </View>
            ) : null}
            {showTimePicker ? (
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimePickerChange}
                  themeVariant={Platform.OS === 'ios' ? 'light' : undefined}
                />
              </View>
            ) : null}
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                testID={`tally-card-${tally.id}-cancel-edit-button`}
                style={[styles.modalSecondaryButton, (isSaving || isDeleting) ? styles.modalPrimaryButtonDisabled : undefined]}
                onPress={handleCloseSettings}
                activeOpacity={0.85}
                disabled={isSaving || isDeleting}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="tally-card-start-editor-save-button"
                style={[styles.modalPrimaryButton, (isSaving || isDeleting) ? styles.modalPrimaryButtonDisabled : undefined]}
                onPress={handleSaveStartDate}
                activeOpacity={0.85}
                disabled={isSaving || isDeleting}
              >
                {isSaving ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.modalPrimaryButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
            {deleteErrorText ? <Text style={styles.errorText}>{deleteErrorText}</Text> : null}
            {confirmingDelete ? (
              <View style={styles.deleteConfirmBlock}>
                <Text style={styles.deleteConfirmTitle}>Delete tracker?</Text>
                <Text style={styles.deleteConfirmSubtitle}>
                  This tracker and its history will be removed. This action cannot be undone.
                </Text>
                <View style={styles.deleteButtonsRow}>
                  <TouchableOpacity
                    testID={`tally-card-${tally.id}-cancel-delete-button`}
                    style={[styles.deleteCancelButton, isDeleting ? styles.modalPrimaryButtonDisabled : undefined]}
                    onPress={() => {
                      if (isDeleting) {
                        return;
                      }
                      setConfirmingDelete(false);
                      setDeleteErrorText(null);
                    }}
                    activeOpacity={0.85}
                    disabled={isDeleting}
                  >
                    <Text style={styles.deleteCancelText}>Keep tracker</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID={`tally-card-${tally.id}-confirm-delete-button`}
                    style={[styles.deleteConfirmButton, isDeleting ? styles.modalPrimaryButtonDisabled : undefined]}
                    onPress={async () => {
                      if (isDeleting) {
                        return;
                      }
                      setIsDeleting(true);
                      setDeleteErrorText(null);
                      try {
                        console.log('TallyCard: deleting tracker', tally.id);
                        await deleteTally(tally.id);
                        setEditorVisible(false);
                        setShowDatePicker(false);
                        setShowTimePicker(false);
                        setConfirmingDelete(false);
                      } catch (error) {
                        console.error('TallyCard: failed to delete tracker', error);
                        setDeleteErrorText('Could not delete tracker. Please try again.');
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    activeOpacity={0.85}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <View style={styles.deleteConfirmContent}>
                        <Trash2 size={16} color={Colors.white} />
                        <Text style={styles.deleteConfirmText}>Delete</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                testID={`tally-card-${tally.id}-delete-button`}
                style={[styles.deleteButton, (isSaving || isDeleting) ? styles.modalPrimaryButtonDisabled : undefined]}
                onPress={() => {
                  if (isSaving || isDeleting) {
                    return;
                  }
                  setConfirmingDelete(true);
                  setDeleteErrorText(null);
                }}
                activeOpacity={0.85}
                disabled={isSaving || isDeleting}
              >
                <View style={styles.deleteButtonContent}>
                  <Trash2 size={16} color={Colors.white} />
                  <Text style={styles.deleteButtonText}>Delete tracker</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 28,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 18,
  },
  container: {
    gap: 18,
    backgroundColor: 'rgba(79,70,229,0.12)',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.26)',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.22)',
  },
  emoji: {
    fontSize: 30,
  },
  titleBlock: {
    gap: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(49,46,129,0.76)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(79,70,229,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.24)',
  },
  timerBlock: {
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#3730A3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 28,
    elevation: 12,
  },
  timeValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1E1B4B',
    letterSpacing: 0.75,
  },
  timeLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(49,46,129,0.7)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 6, 24, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 28,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 26,
    gap: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1A4F',
  },
  modalSubtitle: {
    fontSize: 15,
    color: 'rgba(51,45,117,0.75)',
    lineHeight: 22,
  },
  currentValueBlock: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.18)',
    backgroundColor: 'rgba(99,102,241,0.08)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
  },
  currentValueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(51,45,117,0.6)',
  },
  currentValueValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1A4F',
  },
  currentValueTime: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(51,45,117,0.68)',
  },
  pickerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pickerTrigger: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.28)',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  pickerTriggerText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  pickerWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.18)',
    backgroundColor: 'rgba(250,250,255,1)',
    paddingVertical: Platform.OS === 'ios' ? 12 : 4,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(28,27,76,0.16)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1A4F',
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  modalPrimaryButtonDisabled: {
    opacity: 0.65,
  },
  modalPrimaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  deleteButton: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7F1D1D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  deleteConfirmBlock: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
    backgroundColor: 'rgba(254,242,242,1)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 14,
  },
  deleteConfirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#991B1B',
  },
  deleteConfirmSubtitle: {
    fontSize: 14,
    color: 'rgba(153,27,27,0.85)',
    lineHeight: 20,
  },
  deleteButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(153,27,27,0.45)',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  deleteConfirmButton: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#B91C1C',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
