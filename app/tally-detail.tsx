import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Platform, Animated, Easing } from 'react-native';
import type { View as RNView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, TrendingUp, Heart, RotateCcw, Lock, Sparkles } from 'lucide-react-native';
import BackButton from '../components/BackButton';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import ConfettiBurst from '../components/ConfettiBurst';
import MilestoneCelebration from '../components/MilestoneCelebration';
import { Svg, Circle } from 'react-native-svg';
import Colors from '../constants/colors';
import { useTallies } from '../contexts/tallies';
import { getCategoryOption } from '../constants/tallies';
import { calculateTimeElapsed, calculateMoneySaved, calculateMonthsAndDays, formatTime, formatMoney } from '../utils/tally';

const PROGRESS_RING_OUTER_SIZE = 220;
const PROGRESS_RING_SIZE = 186;
const PROGRESS_RING_STROKE = 14;
const PROGRESS_RING_RADIUS = (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE) / 2;
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const GOLD_BADGE_COLORS = ['#FDE68A', '#F59E0B'];
const LOCKED_BADGE_BACKGROUND = 'rgba(255, 255, 255, 0.14)';
const BADGE_TEXT_LOCKED = 'rgba(255, 255, 255, 0.65)';

type TimeBreakdown = ReturnType<typeof calculateTimeElapsed>;
interface MilestoneBadge {
  days: number;
  label: string;
}

const getDayProgress = (elapsed: TimeBreakdown) => {
  const totalSeconds = elapsed.hours * 3600 + elapsed.minutes * 60 + elapsed.seconds;
  return Math.min(1, totalSeconds / 86400);
};

export default function TallyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { tallies, updateTally } = useTallies();

  const trackerShotRef = useRef<RNView | null>(null);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [celebrationMilestone, setCelebrationMilestone] = useState<MilestoneBadge | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const hasInitializedMilestones = useRef(false);
  const lastCelebratedMilestone = useRef(0);
  const milestoneBadges = useMemo<MilestoneBadge[]>(() => [
    { days: 1, label: '24 Hours' },
    { days: 3, label: '3 Days' },
    { days: 7, label: '1 Week' },
    { days: 30, label: '1 Month' },
    { days: 90, label: '90 Days' },
    { days: 365, label: '1 Year' },
  ], []);

  const tally = tallies.find(t => t.id === id);
  const [time, setTime] = useState<TimeBreakdown | null>(tally ? calculateTimeElapsed(tally.startDate) : null);
  const [showDateTimeSheet, setShowDateTimeSheet] = useState<boolean>(false);
  const [tempDate, setTempDate] = useState<Date>(tally ? new Date(tally.startDate) : new Date());
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const isWeb = Platform.OS === 'web';
  const [ringStrokeDashoffset, setRingStrokeDashoffset] = useState<number>(PROGRESS_RING_CIRCUMFERENCE);
  const dailyProgress = useMemo(() => {
    if (!time) {
      return 0;
    }
    return getDayProgress(time);
  }, [time]);

  const startConfetti = useCallback((duration: number = 1800) => {
    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }
    setIsConfettiActive(true);
    confettiTimeoutRef.current = setTimeout(() => {
      setIsConfettiActive(false);
      confettiTimeoutRef.current = null;
    }, duration);
  }, []);

  useEffect(() => {
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!tally) return;

    const interval = setInterval(() => {
      setTime(calculateTimeElapsed(tally.startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [tally]);

  useEffect(() => {
    if (!time) {
      return;
    }
    if (isWeb) {
      const nextOffset = PROGRESS_RING_CIRCUMFERENCE * (1 - dailyProgress);
      console.log('Updating sobriety ring progress (web)', {
        progress: dailyProgress,
        totalDays: time.totalDays,
        strokeDashoffset: nextOffset,
      });
      setRingStrokeDashoffset(nextOffset);
      return;
    }
    console.log('Updating sobriety ring progress', {
      progress: dailyProgress,
      totalDays: time.totalDays,
    });
    Animated.timing(progressAnim, {
      toValue: dailyProgress,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [dailyProgress, isWeb, progressAnim, time]);

  const hasTime = Boolean(time);
  const totalDays = time?.totalDays ?? 0;
  const displayedMilestones = useMemo(() => {
    if (milestoneBadges.length === 0) {
      return [] as MilestoneBadge[];
    }
    const unlockedIndex = milestoneBadges.reduce((index, badge, idx) => {
      if (totalDays >= badge.days) {
        return idx;
      }
      return index;
    }, -1);

    if (unlockedIndex >= 0) {
      const list: MilestoneBadge[] = [milestoneBadges[unlockedIndex]];
      let forwardIndex = unlockedIndex + 1;
      while (list.length < 3 && forwardIndex < milestoneBadges.length) {
        list.push(milestoneBadges[forwardIndex]);
        forwardIndex += 1;
      }
      return list;
    }

    return milestoneBadges.slice(0, 3);
  }, [milestoneBadges, totalDays]);
  const { months: elapsedMonths, days: elapsedDays } = useMemo(() => {
    if (!tally) {
      return { months: 0, days: 0 };
    }
    return calculateMonthsAndDays(tally.startDate);
  }, [tally, time?.totalDays]);

  useEffect(() => {
    if (!hasTime) {
      return;
    }
    const unlocked = milestoneBadges.filter(badge => totalDays >= badge.days);
    const highestUnlocked = unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
    if (!hasInitializedMilestones.current) {
      hasInitializedMilestones.current = true;
      lastCelebratedMilestone.current = highestUnlocked?.days ?? 0;
      return;
    }
    if (highestUnlocked && highestUnlocked.days > lastCelebratedMilestone.current) {
      lastCelebratedMilestone.current = highestUnlocked.days;
      setCelebrationMilestone(highestUnlocked);
      setShowCelebrationModal(true);
      startConfetti();
    }
  }, [hasTime, milestoneBadges, startConfetti, totalDays]);

  if (!tally || !time) {
    return null;
  }

  const animatedStrokeDashoffset = isWeb
    ? ringStrokeDashoffset
    : progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [PROGRESS_RING_CIRCUMFERENCE, 0],
      });
  const ProgressCircleComponent = isWeb ? Circle : AnimatedCircle;
  const dayCount = Math.max(1, time.totalDays + 1);
  const formattedTimerValue = formatTime(time.days, time.hours, time.minutes, time.seconds);

  const option = getCategoryOption(tally.category);
  const displayName = tally.customName || option?.label || tally.category;
  const moneySaved = calculateMoneySaved(tally.dailyCost, tally.startDate);
  const formattedDateLabel = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(tempDate), [tempDate]);
  const formattedTimeLabel = useMemo(() => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(tempDate), [tempDate]);

  const handleEditStartDate = () => {
    const currentStart = new Date(tally.startDate);

    if (Platform.OS === 'android') {
      const openTimePicker = (baseDate: Date) => {
        DateTimePickerAndroid.open({
          value: baseDate,
          mode: 'time',
          is24Hour: false,
          onChange: (timeEvent, timeValue) => {
            if (timeEvent.type === 'dismissed' || !timeValue) {
              return;
            }
            const finalDate = new Date(baseDate);
            finalDate.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);
            confirmDateChange(finalDate);
          },
        });
      };

      DateTimePickerAndroid.open({
        value: currentStart,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (dateEvent, dateValue) => {
          if (dateEvent.type === 'dismissed' || !dateValue) {
            return;
          }
          const nextDate = new Date(currentStart);
          nextDate.setFullYear(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
          openTimePicker(nextDate);
        },
      });
      return;
    }

    const normalized = new Date(currentStart);
    normalized.setSeconds(0, 0);
    setTempDate(normalized);
    setShowDateTimeSheet(true);
  };

  const handleInlineDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }
    setTempDate((prev) => {
      const next = new Date(prev);
      next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      return next;
    });
  };

  const handleInlineTimeChange = (_event: DateTimePickerEvent, selectedTime?: Date) => {
    if (!selectedTime) {
      return;
    }
    setTempDate((prev) => {
      const next = new Date(prev);
      next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      return next;
    });
  };

  const confirmDateChange = async (date: Date) => {
    const sanitized = new Date(date);
    sanitized.setSeconds(0, 0);
    if (sanitized.getTime() > Date.now()) {
      Alert.alert('Invalid Date', 'Start date cannot be in the future.');
      return;
    }

    Alert.alert(
      'Change Start Date',
      'Changing the start date will reset your timer. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateTally(id, { startDate: sanitized.getTime() });
              setTempDate(sanitized);
              setShowDateTimeSheet(false);
              console.log('Start date updated successfully');
            } catch (error) {
              console.log('Failed to update start date', error);
              Alert.alert('Error', 'We could not update the start date. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleResetPress = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = async () => {
    await updateTally(id, { startDate: Date.now() });
    setShowResetModal(false);
    setResetReason('');
    Alert.alert(
      'You’re Still Strong',
      'Remember: progress isn’t perfect. Every moment is a new chance to start again. We’re here with you.',
      [{ text: 'Continue', style: 'default' }]
    );
  };

  const handleCloseCelebration = useCallback(() => {
    setShowCelebrationModal(false);
  }, []);

  const handleSharePress = useCallback(async () => {
    if (isSharing || !trackerShotRef.current) {
      return;
    }
    let fileUri: string | null = null;
    try {
      setIsSharing(true);
      startConfetti(2200);
      await new Promise<void>((resolve) => setTimeout(resolve, 420));
      const base64 = await captureRef(trackerShotRef, {
        format: 'png',
        quality: 0.95,
        result: 'base64',
      });
      if (!base64) {
        throw new Error('capture_failed');
      }
      if (Platform.OS === 'web') {
        if (typeof document !== 'undefined') {
          const link = document.createElement('a');
          link.href = `data:image/png;base64,${base64}`;
          link.download = `tally-celebration-${Date.now()}.png`;
          link.click();
        }
        return;
      }
      const cacheDirectory = FileSystemLegacy.cacheDirectory ?? FileSystemLegacy.documentDirectory;
      if (!cacheDirectory) {
        throw new Error('missing_cache_directory');
      }
      fileUri = `${cacheDirectory}tally-celebration-${Date.now()}.png`;
      await FileSystemLegacy.writeAsStringAsync(fileUri, base64, { encoding: FileSystemLegacy.EncodingType.Base64 });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Sharing Unavailable', 'We saved your celebration image to device storage.');
      }
    } catch (error) {
      console.error('Failed to share tally celebration', error);
      Alert.alert('Unable to Share', 'We could not create the celebration image. Please try again.');
    } finally {
      if (fileUri) {
        try {
          await FileSystemLegacy.deleteAsync(fileUri, { idempotent: true });
        } catch (cleanupError) {
          console.warn('Share file cleanup failed', cleanupError);
        }
      }
      setIsSharing(false);
    }
  }, [isSharing, startConfetti]);


  return (
    <View ref={trackerShotRef} style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 18 }]}
      >
        <View style={styles.headerTop}>
          <BackButton color={Colors.white} style={styles.closeButton} testID="tally-detail-back" />
          <View style={styles.headerTopSpacer} />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.title}>{displayName}</Text>
          <Text style={styles.subtitle}>{tally.type === 'sobriety' ? 'Alcohol Sobriety Journey' : 'Life Event'}</Text>
        </View>

        <View style={styles.headerSummary}>
          <TouchableOpacity
            testID="tally-progress-ring"
            style={styles.progressRingTouchable}
            onPress={handleEditStartDate}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.progressRingGradient}
            >
              <View style={styles.progressRingWrapper}>
                <Svg
                  style={styles.progressSvg}
                  width={PROGRESS_RING_SIZE}
                  height={PROGRESS_RING_SIZE}
                  viewBox={`0 0 ${PROGRESS_RING_SIZE} ${PROGRESS_RING_SIZE}`}
                >
                  <Circle
                    cx={PROGRESS_RING_SIZE / 2}
                    cy={PROGRESS_RING_SIZE / 2}
                    r={PROGRESS_RING_RADIUS}
                    stroke="rgba(255,255,255,0.18)"
                    strokeWidth={PROGRESS_RING_STROKE}
                    fill="transparent"
                  />
                  <ProgressCircleComponent
                    cx={PROGRESS_RING_SIZE / 2}
                    cy={PROGRESS_RING_SIZE / 2}
                    r={PROGRESS_RING_RADIUS}
                    stroke={Colors.white}
                    strokeWidth={PROGRESS_RING_STROKE}
                    strokeDasharray={`${PROGRESS_RING_CIRCUMFERENCE} ${PROGRESS_RING_CIRCUMFERENCE}`}
                    strokeDashoffset={animatedStrokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    transform={`rotate(-90 ${PROGRESS_RING_SIZE / 2} ${PROGRESS_RING_SIZE / 2})`}
                  />
                </Svg>
                <View style={styles.progressRingInner}>
                  {elapsedMonths >= 1 ? (
                    <>
                      <Text style={styles.progressPrimaryValue}>
                        {`${elapsedMonths} ${elapsedMonths === 1 ? 'Month' : 'Months'}`}
                      </Text>
                      <Text style={styles.progressSecondaryLabel}>
                        {`${elapsedDays} ${elapsedDays === 1 ? 'Day' : 'Days'}`}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.progressPrimaryValue}>{time.totalDays}</Text>
                      <Text style={styles.progressPrimaryLabel}>Days Sober</Text>
                    </>
                  )}
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.milestoneSection} testID="milestone-badge-row">
            <View style={styles.milestoneRow}>
              {displayedMilestones.map((badge) => {
                const unlocked = totalDays >= badge.days;
                const badgeContent = (
                  <>
                    <View
                      style={[
                        styles.milestoneIconShell,
                        unlocked ? styles.milestoneIconShellUnlocked : styles.milestoneIconShellLocked,
                      ]}
                    >
                      {unlocked ? (
                        <Sparkles size={18} color={Colors.primary} />
                      ) : (
                        <Lock size={16} color={BADGE_TEXT_LOCKED} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.milestoneLabel,
                        unlocked ? styles.milestoneLabelUnlocked : styles.milestoneLabelLocked,
                      ]}
                    >
                      {badge.label}
                    </Text>
                  </>
                );

                if (unlocked) {
                  return (
                    <LinearGradient
                      key={badge.days}
                      colors={GOLD_BADGE_COLORS}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.milestoneBadge, styles.milestoneBadgeUnlocked]}
                    >
                      {badgeContent}
                    </LinearGradient>
                  );
                }

                return (
                  <View key={badge.days} style={[styles.milestoneBadge, styles.milestoneBadgeLocked]}>
                    {badgeContent}
                  </View>
                );
              })}
            </View>
          </View>
          <Text style={styles.progressSubtext}>Day {dayCount} · Keep Going</Text>
          <View style={styles.timerWrapper}>
            <View style={styles.timerBox}>
              <Text style={styles.timerValue}>{formattedTimerValue}</Text>
            </View>
            <Text style={styles.timerSubtle}>Your comeback story is unfolding.</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
      >
        {tally.dailyCost > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.statBox}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color={Colors.white} />
              </View>
              <Text style={styles.statValue}>{formatMoney(moneySaved)}</Text>
              <Text style={styles.statLabel}>Money Saved</Text>
            </View>
          </View>
        )}

        {tally.reason && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color={Colors.danger} />
              <Text style={styles.sectionTitle}>Your Why</Text>
            </View>
            <Text style={styles.reasonText}>{tally.reason}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.resetButton} onPress={handleResetPress}>
          <RotateCcw size={20} color={Colors.white} />
          <Text style={styles.resetButtonText}>Reset Tally</Text>
        </TouchableOpacity>
      </ScrollView>

      {showDateTimeSheet && (
        <Modal
          visible={showDateTimeSheet}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDateTimeSheet(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderText}>
                  <Text style={styles.modalTitle}>Adjust Start Date & Time</Text>
                  <Text style={styles.modalSubtitle}>Choose the exact moment your tracker begins.</Text>
                </View>
                <TouchableOpacity onPress={() => setShowDateTimeSheet(false)} testID="start-date-close-button">
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalSummary}>
                <Text style={styles.summaryLabel}>Selected Start</Text>
                <Text style={styles.summaryDate}>{formattedDateLabel}</Text>
                <Text style={styles.summaryTime}>{formattedTimeLabel}</Text>
              </View>
              <View style={styles.pickerGrid}>
                <View style={styles.pickerCard}>
                  <Text style={styles.pickerTitle}>Date</Text>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={handleInlineDateChange}
                  />
                </View>
                <View style={styles.pickerCard}>
                  <Text style={styles.pickerTitle}>Time</Text>
                  <DateTimePicker
                    value={tempDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleInlineTimeChange}
                  />
                </View>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  testID="start-date-cancel-button"
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowDateTimeSheet(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="start-date-confirm-button"
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={() => confirmDateChange(tempDate)}
                >
                  <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.resetModalOverlay}>
          <View style={styles.resetModalContent}>
            <View style={styles.resetModalIcon}>
              <RotateCcw size={32} color={Colors.danger} />
            </View>
            
            <Text style={styles.resetModalTitle}>Reset Your Tally?</Text>
            <Text style={styles.resetModalMessage}>
              We know this is hard. Setbacks happen, and that’s okay. You’re taking the first step by being honest with yourself.
            </Text>

            <Text style={styles.resetModalQuestion}>What happened? (Optional)</Text>
            <View style={styles.resetReasonContainer}>
              <TouchableOpacity
                style={[styles.resetReasonButton, resetReason === 'stress' && styles.resetReasonButtonActive]}
                onPress={() => setResetReason(resetReason === 'stress' ? '' : 'stress')}
              >
                <Text style={[styles.resetReasonText, resetReason === 'stress' && styles.resetReasonTextActive]}>Stress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetReasonButton, resetReason === 'temptation' && styles.resetReasonButtonActive]}
                onPress={() => setResetReason(resetReason === 'temptation' ? '' : 'temptation')}
              >
                <Text style={[styles.resetReasonText, resetReason === 'temptation' && styles.resetReasonTextActive]}>Temptation</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetReasonButton, resetReason === 'social' && styles.resetReasonButtonActive]}
                onPress={() => setResetReason(resetReason === 'social' ? '' : 'social')}
              >
                <Text style={[styles.resetReasonText, resetReason === 'social' && styles.resetReasonTextActive]}>Social Pressure</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resetReasonButton, resetReason === 'emotional' && styles.resetReasonButtonActive]}
                onPress={() => setResetReason(resetReason === 'emotional' ? '' : 'emotional')}
              >
                <Text style={[styles.resetReasonText, resetReason === 'emotional' && styles.resetReasonTextActive]}>Emotional</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.resetModalReminder}>
              Remember: Every journey has ups and downs. This doesn’t erase your progress or strength.
            </Text>

            <View style={styles.resetModalButtons}>
              <TouchableOpacity
                style={styles.resetModalButtonCancel}
                onPress={() => {
                  setShowResetModal(false);
                  setResetReason('');
                }}
              >
                <Text style={styles.resetModalButtonTextCancel}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetModalButtonConfirm}
                onPress={handleConfirmReset}
              >
                <Text style={styles.resetModalButtonTextConfirm}>Reset & Continue</Text>
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
    backgroundColor: Colors.primary,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTopSpacer: {
    width: 40,
    height: 40,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.white,
    opacity: 0.92,
    fontWeight: '600' as const,
  },
  headerSummary: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  progressRingTouchable: {
    width: PROGRESS_RING_OUTER_SIZE,
    height: PROGRESS_RING_OUTER_SIZE,
    borderRadius: PROGRESS_RING_OUTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a103a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 28,
    elevation: 16,
  },
  progressRingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: PROGRESS_RING_OUTER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressRingWrapper: {
    width: PROGRESS_RING_SIZE,
    height: PROGRESS_RING_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressRingInner: {
    alignItems: 'center',
    gap: 4,
  },
  milestoneSection: {
    width: '100%',
    paddingTop: 6,
  },
  milestoneRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  milestoneBadge: {
    minWidth: 86,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  milestoneBadgeLocked: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  milestoneBadgeUnlocked: {
    borderWidth: 0,
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  milestoneIconShell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneIconShellLocked: {
    backgroundColor: LOCKED_BADGE_BACKGROUND,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  milestoneIconShellUnlocked: {
    backgroundColor: Colors.white,
  },
  milestoneLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  milestoneLabelLocked: {
    color: BADGE_TEXT_LOCKED,
  },
  milestoneLabelUnlocked: {
    color: Colors.primary,
  },
  progressPrimaryValue: {
    fontSize: 48,
    fontWeight: '900' as const,
    color: Colors.white,
    textAlign: 'center',
  },
  progressPrimaryLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.84)',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  progressSecondaryLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.84)',
    textAlign: 'center',
  },
  progressSubtext: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  timerWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  timerBox: {
    width: '100%',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  timerSubtle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
    opacity: 0.65,
  },
  timerValue: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 18,
    gap: 16,
  },
  statsSection: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    position: 'relative' as const,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600' as const,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  reasonText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
  restCard: {
    borderRadius: 24,
    padding: 24,
    gap: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  restContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  restIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTextBlock: {
    flex: 1,
    gap: 6,
  },
  restTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  restDescription: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.88)',
    lineHeight: 22,
  },
  restButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  restButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
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
    gap: 16,
  },
  modalHeaderText: {
    flex: 1,
    gap: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  modalSummary: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  summaryTime: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 16,
    marginBottom: 20,
  },
  pickerCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 18,
    padding: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  resetModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resetModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 400,
  },
  resetModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.danger + '15',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  resetModalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  resetModalMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  resetModalQuestion: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  resetReasonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  resetReasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetReasonButtonActive: {
    backgroundColor: Colors.danger + '15',
    borderColor: Colors.danger,
  },
  resetReasonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  resetReasonTextActive: {
    color: Colors.danger,
  },
  resetModalReminder: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    fontStyle: 'italic' as const,
  },
  resetModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetModalButtonCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  resetModalButtonConfirm: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.danger,
    alignItems: 'center',
  },
  resetModalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  resetModalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
});
