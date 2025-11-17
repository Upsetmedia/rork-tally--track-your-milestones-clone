import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CreditCard, Clock, ShieldCheck, Sparkles, Gift, CheckCircle2 } from 'lucide-react-native';
import BackButton from '../components/BackButton';
import Colors from '../constants/colors';

const validGiftCodes: Record<string, string> = {
  SOBERCREW: 'Complimentary Access – First year on us',
  GIFTEDRESET: 'Gifted Pass – Lifetime access on us',
  COMMUNITYLOVE: 'Community Partner – 6 months free',
};

const planPerks: { id: string; icon: React.ReactNode; title: string; description: string }[] = [
  {
    id: 'perk-1',
    icon: <Sparkles size={18} color={Colors.white} />,
    title: 'Ritual Reminders',
    description: 'Personalized nudges to keep your streak glowing.',
  },
  {
    id: 'perk-2',
    icon: <ShieldCheck size={18} color={Colors.white} />,
    title: 'Guided Toolbox',
    description: 'Unlock all sobriety tools, meditations, and check-ins.',
  },
  {
    id: 'perk-3',
    icon: <CreditCard size={18} color={Colors.white} />,
    title: 'Priority Support',
    description: '1:1 concierge for accountability and fast answers.',
  },
];

export default function SubscribeScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const trialCopy = useMemo(() => {
    if (appliedCode) {
      return validGiftCodes[appliedCode];
    }
    return 'Enjoy a full 7-day free reset. Cancel anytime before 7 days to avoid charges.';
  }, [appliedCode]);

  const handleApplyCode = useCallback(() => {
    const sanitized = promoCodeInput.trim().toUpperCase();
    console.log('[SubscribeScreen] Attempting to apply promo code', { sanitized });
    if (!sanitized) {
      setPromoError('Enter a code to redeem your gifted access.');
      setAppliedCode(null);
      return;
    }
    if (validGiftCodes[sanitized]) {
      setAppliedCode(sanitized);
      setPromoError(null);
      setPromoCodeInput('');
      Alert.alert('Gift Unlocked', 'You now have complimentary access. Welcome to the inner circle!');
      console.log('[SubscribeScreen] Promo code applied', { sanitized });
      return;
    }
    setPromoError('Code not recognized. Double-check with your creator or support.');
    setAppliedCode(null);
    console.log('[SubscribeScreen] Invalid promo code', { sanitized });
  }, [promoCodeInput]);

  const handleCheckout = useCallback(() => {
    console.log('[SubscribeScreen] Checkout pressed', { appliedCode });
    if (appliedCode) {
      Alert.alert('Access Granted', 'Your gifted Tally+ membership is active. Explore premium tools now.');
      router.replace({ pathname: '/(tabs)/settings', params: { subscribed: 'true' } });
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      'You will begin a 7-day free trial. After the trial, billing is $6.99 per month unless you cancel before it ends.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Start Free Week',
          style: 'default',
          onPress: () => {
            console.log('[SubscribeScreen] Free trial confirmed');
            Alert.alert('Trial Activated', 'Your free week has started! We will remind you before billing kicks in.');
            router.replace({ pathname: '/(tabs)/settings', params: { subscribed: 'true' } });
          },
        },
      ],
    );
  }, [appliedCode, router]);

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { paddingTop: insets.top + 18 }]}> 
        <View style={styles.heroHeaderRow}>
          <BackButton
            color={Colors.white}
            style={styles.backButton}
            testID="subscribe-back-button"
            onPress={() => {
              console.log('[SubscribeScreen] Back pressed');
              router.back();
            }}
          />
          <View style={styles.heroBadge}>
            <Clock size={16} color={Colors.white} />
            <Text style={styles.heroBadgeText}>7-Day Free Trial</Text>
          </View>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Unlock Tally+</Text>
          <Text style={styles.heroSubtitle}>Stay grounded with rituals, rapid support, and tools that meet moments of craving.</Text>
        </View>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.priceCluster}>
              <Text style={styles.priceLabel}>After trial</Text>
              <Text style={styles.priceValue}>$6.99</Text>
              <Text style={styles.priceFrequency}>per month • cancel anytime</Text>
            </View>
            <View style={styles.summaryIconBubble}>
              <CreditCard size={24} color={Colors.primary} />
            </View>
          </View>
          <View style={styles.trialBanner}>
            <Sparkles size={18} color={Colors.white} />
            <Text style={styles.trialBannerText}>{trialCopy}</Text>
          </View>
          <View style={styles.perkList}>
            {planPerks.map(perk => (
              <View key={perk.id} style={styles.perkRow}>
                <View style={styles.perkIconBubble}>
                  {perk.icon}
                </View>
                <View style={styles.perkTextGroup}>
                  <Text style={styles.perkTitle}>{perk.title}</Text>
                  <Text style={styles.perkDescription}>{perk.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoHeader}>
            <Gift size={20} color={Colors.primary} />
            <Text style={styles.promoTitle}>Have a gifted code?</Text>
          </View>
          <Text style={styles.promoSubtitle}>Redeem complimentary access shared by partners and community leaders.</Text>
          <View style={styles.promoInputRow}>
            <TextInput
              testID="promo-code-input"
              style={styles.promoInput}
              value={promoCodeInput}
              onChangeText={setPromoCodeInput}
              placeholder="Enter code"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyCode}
              activeOpacity={0.85}
              testID="promo-apply-button"
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {appliedCode && (
            <View style={styles.promoSuccess} testID="promo-success-message">
              <CheckCircle2 size={18} color={Colors.success} />
              <Text style={styles.promoSuccessText}>Code {appliedCode} applied. {validGiftCodes[appliedCode]}</Text>
            </View>
          )}
          {promoError && (
            <Text style={styles.promoError} testID="promo-error-message">{promoError}</Text>
          )}
        </View>

        <View style={styles.checkoutCard}>
          <Text style={styles.checkoutTitle}>Checkout summary</Text>
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutLabel}>Today</Text>
            <Text style={styles.checkoutValue}>{appliedCode ? '$0.00 • Complimentary access' : '$0.00 • Free for 7 days'}</Text>
          </View>
          <View style={styles.checkoutRow}>
            <Text style={styles.checkoutLabel}>After 7 days</Text>
            <Text style={styles.checkoutValue}>{appliedCode ? '$0.00 • Covered by your code' : '$6.99 / month'}</Text>
          </View>
          {!appliedCode && (
            <Text style={styles.checkoutNote}>You can cancel anytime before your free week ends to avoid billing.</Text>
          )}
          {Platform.OS === 'web' && (
            <Text style={styles.webNotice}>Secure web checkout will open in a modal window.</Text>
          )}
          <TouchableOpacity
            style={[styles.primaryButton, appliedCode && styles.primaryButtonGifted]}
            onPress={handleCheckout}
            activeOpacity={0.85}
            testID="checkout-button"
          >
            <Text style={[styles.primaryButtonText, appliedCode && styles.primaryButtonTextGifted]}>
              {appliedCode ? 'Activate Gifted Access' : 'Start Free Week'}
            </Text>
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
  hero: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  heroCopy: {
    marginTop: 28,
    gap: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 140,
    gap: 24,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceCluster: {
    gap: 6,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  priceValue: {
    fontSize: 34,
    fontWeight: '900' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  priceFrequency: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  summaryIconBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(99,102,241,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trialBannerText: {
    flex: 1,
    fontSize: 14,
    color: Colors.white,
    fontWeight: '700' as const,
    lineHeight: 20,
  },
  perkList: {
    gap: 16,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  perkIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  perkTextGroup: {
    flex: 1,
    gap: 4,
  },
  perkTitle: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  perkDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  promoCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 22,
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 5,
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  promoSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  promoSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 14,
    padding: 12,
  },
  promoSuccessText: {
    flex: 1,
    fontSize: 13,
    color: Colors.success,
    fontWeight: '700' as const,
    lineHeight: 18,
  },
  promoError: {
    fontSize: 13,
    color: Colors.danger,
    fontWeight: '700' as const,
  },
  checkoutCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 24,
    gap: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 6,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: '900' as const,
    color: Colors.text,
  },
  checkoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
  },
  checkoutValue: {
    fontSize: 15,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  checkoutNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  webNotice: {
    fontSize: 12,
    color: Colors.textTertiary,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonGifted: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 2,
    borderColor: Colors.success,
    shadowColor: 'rgba(16, 185, 129, 0.6)',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900' as const,
    color: Colors.white,
    letterSpacing: 0.3,
  },
  primaryButtonTextGifted: {
    color: Colors.success,
  },
});
