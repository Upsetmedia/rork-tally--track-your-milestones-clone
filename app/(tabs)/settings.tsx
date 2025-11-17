import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User as UserIcon, AtSign, MapPin, Info, UserX, LogOut, Phone, Calendar, Bell, Moon, Lock, FileText, HelpCircle, MessageCircle, Mail, Shield, Book, Sparkles, Download, Trash2, CreditCard, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ subscribed?: string }>();
  const { user, updateProfile, logout } = useAuth();
  const [nameInput, setNameInput] = useState<string>(user?.name ?? '');
  const [usernameInput, setUsernameInput] = useState<string>(user?.username ?? '');
  const [addressInput, setAddressInput] = useState<string>(user?.mailingAddress ?? '');
  const [ageInput, setAgeInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [dailyCheckInReminder, setDailyCheckInReminder] = useState<boolean>(true);
  const [journalReminder, setJournalReminder] = useState<boolean>(true);
  const [streakAlerts, setStreakAlerts] = useState<boolean>(true);
  const [milestoneNotifications, setMilestoneNotifications] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [postPrivacy, setPostPrivacy] = useState<'everyone' | 'followers' | 'only-me'>('everyone');
  const [tallyVisibility, setTallyVisibility] = useState<'friends' | 'private'>('friends');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    setNameInput(user?.name ?? '');
    setUsernameInput(user?.username ?? '');
    setAddressInput(user?.mailingAddress ?? '');
  }, [user?.name, user?.username, user?.mailingAddress]);

  useEffect(() => {
    if (searchParams.subscribed === 'true' && !isSubscribed) {
      console.log('[SettingsScreen] Subscription status updated from params: active');
      setIsSubscribed(true);
    } else if (searchParams.subscribed === 'false' && isSubscribed) {
      console.log('[SettingsScreen] Subscription status updated from params: inactive');
      setIsSubscribed(false);
    }
  }, [isSubscribed, searchParams.subscribed]);

  const sanitizedHandle = useMemo(() => {
    return usernameInput.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }, [usernameInput]);

  const previewHandle = sanitizedHandle || (user?.username ?? 'tallyuser');

  const hasChanges = useMemo(() => {
    const currentName = user?.name ?? '';
    const currentHandle = user?.username ?? '';
    const currentAddress = user?.mailingAddress ?? '';
    return (
      nameInput.trim() !== currentName.trim() ||
      (sanitizedHandle || currentHandle).trim() !== currentHandle.trim() ||
      addressInput.trim() !== currentAddress.trim()
    );
  }, [addressInput, nameInput, sanitizedHandle, user?.mailingAddress, user?.name, user?.username]);

  const handleSaveProfile = useCallback(async () => {
    if (!user) {
      Alert.alert('Not logged in', 'Please log in to update your settings.');
      return;
    }

    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Your display name cannot be empty.');
      return;
    }

    const nextHandle = (sanitizedHandle || 'tallyuser').slice(0, 24);
    console.log('[SettingsScreen] Saving profile', { trimmedName, nextHandle });

    try {
      await updateProfile({
        name: trimmedName,
        username: nextHandle,
        mailingAddress: addressInput.trim() ? addressInput.trim() : undefined,
      });
      Alert.alert('Saved', 'Your profile settings have been updated.');
    } catch (error) {
      console.error('[SettingsScreen] Failed to save profile', error);
      Alert.alert('Error', 'We could not update your settings. Please try again.');
    }
  }, [addressInput, nameInput, sanitizedHandle, updateProfile, user]);

  const handleUnblock = useCallback(async (handle: string) => {
    if (!user) {
      return;
    }
    Alert.alert(
      'Unblock user',
      `Are you sure you want to remove @${handle} from your blocked list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            console.log('[SettingsScreen] Unblocking user', handle);
            const remaining = (user.blockedUsers ?? []).filter(item => item !== handle);
            try {
              await updateProfile({ blockedUsers: remaining });
              Alert.alert('User unblocked', `@${handle} can interact with you again.`);
            } catch (error) {
              console.error('[SettingsScreen] Failed to unblock user', error);
              Alert.alert('Error', 'We could not update your blocked list.');
            }
          },
        },
      ],
    );
  }, [updateProfile, user]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            console.log('[SettingsScreen] Logging out');
            await logout();
          },
        },
      ],
    );
  }, [logout]);

  const handleSubscribe = useCallback(() => {
    console.log('[SettingsScreen] Navigating to subscription checkout');
    router.push('/subscribe');
  }, [router]);

  const handleUnsubscribe = useCallback(() => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your Tally+ subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Unsubscribe',
          style: 'destructive',
          onPress: () => {
            console.log('[SettingsScreen] User unsubscribed');
            setIsSubscribed(false);
            Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled. You will keep access until the end of your billing period.');
          },
        },
      ],
    );
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      '⚠️ Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              '⚠️ Final Warning',
              'ALL YOUR DATA WILL BE PERMANENTLY LOST:\n\n• All your tallies and progress\n• Journal entries and mood logs\n• Community posts and connections\n• Personal information\n\nThis cannot be undone. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert(
                      '🛑 Last Confirmation',
                      'Type DELETE to confirm account deletion. All data will be lost forever.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete My Account',
                          style: 'destructive',
                          onPress: async () => {
                            console.log('[SettingsScreen] Account deleted');
                            Alert.alert('Account Deleted', 'Your account and all data have been permanently deleted.');
                            await logout();
                          },
                        },
                      ],
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, [logout]);

  const blockedUsers = user?.blockedUsers ?? [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 32 }]}
      >
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Keep your profile, mailing info, and privacy tuned for support.</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.subscriptionSection}>
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionIconWrapper}>
              <CreditCard size={22} color={Colors.white} />
            </View>
            <View style={styles.subscriptionHeaderText}>
              <Text style={styles.subscriptionTitle}>Manage Subscription</Text>
              <Text style={styles.subscriptionSubtitle}>
                {isSubscribed ? 'Tally+ Active' : 'Upgrade to Tally+'}
              </Text>
            </View>
          </View>

          {isSubscribed ? (
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionStatus}>
                <Sparkles size={18} color={Colors.primary} />
                <Text style={styles.subscriptionStatusText}>Premium Active - $6.99/month</Text>
              </View>
              <TouchableOpacity
                style={styles.unsubscribeButton}
                onPress={handleUnsubscribe}
                activeOpacity={0.8}
              >
                <Text style={styles.unsubscribeButtonText}>Cancel Subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionFeatures}>
                <View style={styles.featureRow}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Unlimited tracking & tallies</Text>
                </View>
                <View style={styles.featureRow}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Exclusive themes & customization</Text>
                </View>
                <View style={styles.featureRow}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureText}>Priority support & early access</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                activeOpacity={0.8}
              >
                <Text style={styles.subscribeButtonText}>Subscribe for $6.99/month</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <UserIcon size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Identity</Text>
              <Text style={styles.sectionDescription}>Update your display name and public handle.</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Display name</Text>
            <TextInput
              testID="settings-name-input"
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textTertiary}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputWithIcon}>
              <AtSign size={18} color={Colors.textTertiary} />
              <TextInput
                testID="settings-username-input"
                style={styles.inputFlex}
                value={usernameInput}
                onChangeText={setUsernameInput}
                autoCapitalize="none"
                placeholder="choose-a-handle"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
            <Text style={styles.helperText}>This becomes @{previewHandle}</Text>
          </View>

          <TouchableOpacity
            testID="settings-save-button"
            style={[styles.primaryButton, !hasChanges && styles.disabledButton]}
            onPress={handleSaveProfile}
            activeOpacity={0.8}
            disabled={!hasChanges}
          >
            <Text style={styles.primaryButtonText}>Save profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Bell size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              <Text style={styles.sectionDescription}>Manage your reminders and alerts</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>All Notifications</Text>
              <Text style={styles.settingSubtext}>Enable or disable all notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.textTertiary, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Text style={styles.settingLabel}>Daily Check-In Reminder</Text>
                  <Text style={styles.settingSubtext}>Get reminded to log your mood</Text>
                </View>
                <Switch
                  value={dailyCheckInReminder}
                  onValueChange={setDailyCheckInReminder}
                  trackColor={{ false: Colors.textTertiary, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Text style={styles.settingLabel}>Journal Reminder</Text>
                  <Text style={styles.settingSubtext}>Daily prompt to write in your journal</Text>
                </View>
                <Switch
                  value={journalReminder}
                  onValueChange={setJournalReminder}
                  trackColor={{ false: Colors.textTertiary, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Text style={styles.settingLabel}>Streak Alerts</Text>
                  <Text style={styles.settingSubtext}>Celebrate your progress milestones</Text>
                </View>
                <Switch
                  value={streakAlerts}
                  onValueChange={setStreakAlerts}
                  trackColor={{ false: Colors.textTertiary, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingRowLeft}>
                  <Text style={styles.settingLabel}>Milestone Celebrations</Text>
                  <Text style={styles.settingSubtext}>Get notified about achievements</Text>
                </View>
                <Switch
                  value={milestoneNotifications}
                  onValueChange={setMilestoneNotifications}
                  trackColor={{ false: Colors.textTertiary, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Moon size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <Text style={styles.sectionDescription}>Customize your app experience</Text>
            </View>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingSubtext}>Switch to a darker theme</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.textTertiary, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Lock size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Privacy</Text>
              <Text style={styles.sectionDescription}>Control who sees your content</Text>
            </View>
          </View>

          <View style={styles.privacyGroup}>
            <Text style={styles.inputLabel}>Who can see your posts?</Text>
            
            <TouchableOpacity
              style={[styles.privacyOption, postPrivacy === 'everyone' && styles.privacyOptionSelected]}
              onPress={() => setPostPrivacy('everyone')}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {postPrivacy === 'everyone' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.privacyOptionText}>
                <Text style={styles.privacyOptionTitle}>Everyone</Text>
                <Text style={styles.privacyOptionSubtext}>Anyone in the community can see your posts</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.privacyOption, postPrivacy === 'followers' && styles.privacyOptionSelected]}
              onPress={() => setPostPrivacy('followers')}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {postPrivacy === 'followers' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.privacyOptionText}>
                <Text style={styles.privacyOptionTitle}>Followers Only</Text>
                <Text style={styles.privacyOptionSubtext}>Only people who follow you</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.privacyOption, postPrivacy === 'only-me' && styles.privacyOptionSelected]}
              onPress={() => setPostPrivacy('only-me')}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {postPrivacy === 'only-me' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.privacyOptionText}>
                <Text style={styles.privacyOptionTitle}>Only Me</Text>
                <Text style={styles.privacyOptionSubtext}>Keep your posts private</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.privacyDivider} />
            <Text style={styles.inputLabel}>Show tallies</Text>

            <TouchableOpacity
              testID="tally-visibility-friends"
              style={[styles.privacyOption, tallyVisibility === 'friends' && styles.privacyOptionSelected]}
              onPress={() => setTallyVisibility('friends')}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {tallyVisibility === 'friends' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.privacyOptionText}>
                <Text style={styles.privacyOptionTitle}>Friends Only</Text>
                <Text style={styles.privacyOptionSubtext}>Share tallies with trusted friends you approve</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              testID="tally-visibility-private"
              style={[styles.privacyOption, tallyVisibility === 'private' && styles.privacyOptionSelected]}
              onPress={() => setTallyVisibility('private')}
              activeOpacity={0.7}
            >
              <View style={styles.radioOuter}>
                {tallyVisibility === 'private' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.privacyOptionText}>
                <Text style={styles.privacyOptionTitle}>Private</Text>
                <Text style={styles.privacyOptionSubtext}>Keep your tallies for your eyes only</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Info size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Personal Info</Text>
              <Text style={styles.sectionDescription}>For gifts, postcards, and support connections.</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Age</Text>
            <View style={styles.inputWithIcon}>
              <Calendar size={18} color={Colors.textTertiary} />
              <TextInput
                testID="settings-age-input"
                style={styles.inputFlex}
                value={ageInput}
                onChangeText={setAgeInput}
                placeholder="Your age"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={18} color={Colors.textTertiary} />
              <TextInput
                testID="settings-phone-input"
                style={styles.inputFlex}
                value={phoneInput}
                onChangeText={setPhoneInput}
                placeholder="(555) 555-5555"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Mailing address</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={18} color={Colors.textTertiary} />
              <TextInput
                testID="settings-address-input"
                style={[styles.inputFlex, styles.multilineInputFlex]}
                value={addressInput}
                onChangeText={setAddressInput}
                placeholder="Street, City, State, ZIP"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.helperText}>Only teammates you approve will see this.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <FileText size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Data & History</Text>
              <Text style={styles.sectionDescription}>Manage your journal and tally data</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Download Data', 'Your data export will be available soon!')}
            activeOpacity={0.7}
          >
            <Download size={20} color={Colors.primary} />
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>Download My Data</Text>
              <Text style={styles.actionRowSubtext}>Export your journals, moods, and tallies</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Alert.alert(
                'Clear History',
                'Are you sure you want to delete all your journal entries? This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: () => Alert.alert('Cleared', 'Your journal history has been deleted.'),
                  },
                ]
              );
            }}
            activeOpacity={0.7}
          >
            <Trash2 size={20} color={Colors.danger} />
            <View style={styles.actionRowText}>
              <Text style={[styles.actionRowTitle, { color: Colors.danger }]}>Clear Journal History</Text>
              <Text style={styles.actionRowSubtext}>Permanently delete all entries</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <HelpCircle size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Support</Text>
              <Text style={styles.sectionDescription}>Get help and share feedback</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('FAQ', 'Frequently asked questions will open here.')}
            activeOpacity={0.7}
          >
            <Book size={20} color={Colors.primary} />
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>FAQ / Help Center</Text>
              <Text style={styles.actionRowSubtext}>Common questions answered</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Linking.openURL('mailto:support@tallyapp.com?subject=Support Request').catch(() =>
                Alert.alert('Error', 'Could not open email client')
              );
            }}
            activeOpacity={0.7}
          >
            <Mail size={20} color={Colors.primary} />
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>Contact Support</Text>
              <Text style={styles.actionRowSubtext}>support@tallyapp.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Feedback', 'Share your ideas and suggestions!')}
            activeOpacity={0.7}
          >
            <MessageCircle size={20} color={Colors.primary} />
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>Send Feedback</Text>
              <Text style={styles.actionRowSubtext}>Help us improve Tally</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <UserX size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Community safety</Text>
              <Text style={styles.sectionDescription}>Review who you have muted from your journey.</Text>
            </View>
          </View>

          {blockedUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <UserX size={24} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No blocked users</Text>
              <Text style={styles.emptyBody}>Everyone can currently reach you. Block someone to remove them from your space.</Text>
            </View>
          ) : (
            <View style={styles.blockedList}>
              {blockedUsers.map(handle => (
                <View key={handle} style={styles.blockedRow}>
                  <View style={styles.blockedInfo}>
                    <UserX size={18} color={Colors.textSecondary} />
                    <Text style={styles.blockedHandle}>@{handle}</Text>
                  </View>
                  <TouchableOpacity
                    testID={`blocked-user-${handle}`}
                    style={styles.unblockButton}
                    onPress={() => handleUnblock(handle)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.unblockText}>Unblock</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Shield size={20} color={Colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Legal & About</Text>
              <Text style={styles.sectionDescription}>App information and policies</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Terms of Use', 'Terms and conditions will be displayed here.')}
            activeOpacity={0.7}
          >
            <FileText size={20} color={Colors.textSecondary} />
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>Terms of Use</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy details will be shown here.')}
            activeOpacity={0.7}
          >
            <Shield size={20} color={Colors.textSecondary} />
            <View style={styles.actionRowText}>
              <Text style={styles.actionRowTitle}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.versionRow}>
            <Sparkles size={18} color={Colors.textTertiary} />
            <Text style={styles.versionText}>Tally App v1.0.0</Text>
          </View>
        </View>

        <View style={styles.sectionDanger}>
          <View style={styles.dangerHeader}>
            <LogOut size={20} color={Colors.danger} />
            <Text style={styles.dangerTitle}>Sign out of Tally</Text>
          </View>
          <Text style={styles.dangerBody}>Logging out means your daily streak reminders will pause until you return.</Text>
          <TouchableOpacity
            testID="settings-logout-button"
            style={styles.dangerButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.dangerButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionDeleteAccount}>
          <View style={styles.deleteAccountHeader}>
            <AlertTriangle size={20} color="#dc2626" />
            <Text style={styles.deleteAccountTitle}>Delete Account</Text>
          </View>
          <Text style={styles.deleteAccountBody}>Permanently delete your account and all associated data. This action cannot be undone and all data will be lost forever.</Text>
          <TouchableOpacity
            testID="settings-delete-account-button"
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteAccountButtonText}>Delete My Account</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 120,
    gap: 28,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    gap: 18,
    shadowColor: '#1d1d1f',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(93, 63, 211, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderText: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputFlex: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.4,
  },
  multilineInput: {
    minHeight: 120,
  },
  multilineInputFlex: {
    minHeight: 80,
  },
  emptyState: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  emptyBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  blockedList: {
    gap: 12,
  },
  blockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  blockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  blockedHandle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  unblockButton: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  unblockText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  sectionDanger: {
    backgroundColor: '#fff5f5',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.danger,
  },
  dangerBody: {
    fontSize: 14,
    color: Colors.danger,
    lineHeight: 20,
  },
  dangerButton: {
    backgroundColor: Colors.danger,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingRowLeft: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  privacyGroup: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 10,
  },
  privacyOptionSelected: {
    backgroundColor: 'rgba(93, 63, 211, 0.08)',
    borderColor: Colors.primary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  privacyOptionText: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  privacyOptionSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  actionRowText: {
    flex: 1,
  },
  actionRowTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  actionRowSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '600' as const,
  },
  subscriptionSection: {
    backgroundColor: Colors.primary,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  subscriptionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionHeaderText: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: Colors.white,
    marginBottom: 2,
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600' as const,
  },
  subscriptionContent: {
    gap: 16,
  },
  subscriptionFeatures: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureBullet: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '700' as const,
  },
  featureText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600' as const,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  subscriptionStatusText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  unsubscribeButton: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  unsubscribeButtonText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  sectionDeleteAccount: {
    backgroundColor: '#fee',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: '#dc2626',
  },
  deleteAccountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteAccountTitle: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: '#dc2626',
  },
  deleteAccountBody: {
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  deleteAccountButton: {
    backgroundColor: '#dc2626',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#991b1b',
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
