import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Clock, MapPin, Sparkles, Users } from 'lucide-react-native';
import Colors from '../constants/colors';
import BackButton from '../components/BackButton';

const heroOverlay = 'rgba(17, 24, 39, 0.45)';

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
  },
  default: {
    elevation: 8,
  },
});

type CommunityMode = 'virtual' | 'hybrid' | 'in-person';

type CommunityGroup = {
  id: string;
  name: string;
  meetingTime: string;
  format: string;
  description: string;
  members: number;
  focusTags: string[];
  featuredFacilitator: string;
  facilitatorAvatar: string;
  imageUrl: string;
  mode: CommunityMode;
};

type CommunityFilterId = 'all' | CommunityMode;

const COMMUNITY_FILTERS: { id: CommunityFilterId; label: string }[] = [
  { id: 'all', label: 'All circles' },
  { id: 'virtual', label: 'Virtual' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'in-person', label: 'In person' },
];

const COMMUNITIES: CommunityGroup[] = [
  {
    id: 'evening-reset',
    name: 'Evening Reset Circle',
    meetingTime: 'Tonight · 7:00 PM ET',
    format: 'Virtual · Guided check-in + sharing',
    description:
      'Grounding breathwork, mindful prompts, and a transparent share round to close your day in community.',
    members: 248,
    focusTags: ['Breathwork', 'Accountability', 'Night Ritual'],
    featuredFacilitator: 'Amina Walker',
    facilitatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=1200&q=80',
    mode: 'virtual',
  },
  {
    id: 'sunrise-intentions',
    name: 'Sunrise Intentions',
    meetingTime: 'Tomorrow · 8:30 AM ET',
    format: 'Hybrid · Mindful movement + gratitude',
    description:
      'Stretch, breathe, and set intention alongside peers. Includes a weekly accountability pairing.',
    members: 312,
    focusTags: ['Movement', 'Gratitude', 'Morning Ritual'],
    featuredFacilitator: 'Jules Harper',
    facilitatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80',
    mode: 'hybrid',
  },
  {
    id: 'weekend-anchor',
    name: 'Weekend Anchor Collective',
    meetingTime: 'Saturday · 10:00 AM ET',
    format: 'In person · Brooklyn Healing Loft',
    description:
      'Deep-dive journaling with prompts, somatic grounding, and partner reflections to lock in your weekend focus.',
    members: 128,
    focusTags: ['Journaling', 'Somatic', 'Weekly Reset'],
    featuredFacilitator: 'Miles Chen',
    facilitatorAvatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    mode: 'in-person',
  },
  {
    id: 'creative-bravery',
    name: 'Creative Bravery Studio',
    meetingTime: 'Wednesday · 6:30 PM PT',
    format: 'Virtual · Expressive arts therapy',
    description:
      'Unlock resistance with guided expressive arts exercises and collaborative reflection in an intimate cohort.',
    members: 204,
    focusTags: ['Expression', 'Mindfulness', 'Peer Feedback'],
    featuredFacilitator: 'Nova Ellis',
    facilitatorAvatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    mode: 'virtual',
  },
  {
    id: 'steady-sunday',
    name: 'Steady Sunday Reset',
    meetingTime: 'Sunday · 5:00 PM ET',
    format: 'Hybrid · Reflect + plan',
    description:
      'Structure your week with live planning templates, gentle check-ins, and a supportive breakout circle.',
    members: 289,
    focusTags: ['Planning', 'Reflection', 'Resilience'],
    featuredFacilitator: 'Camila Rhodes',
    facilitatorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1200&q=80',
    mode: 'hybrid',
  },
];

export default function CommunityExplorerScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<CommunityFilterId>('all');

  const filteredCommunities = useMemo(() => {
    if (activeFilter === 'all') {
      return COMMUNITIES;
    }
    return COMMUNITIES.filter((group) => group.mode === activeFilter);
  }, [activeFilter]);

  const handleSelectFilter = useCallback((filterId: CommunityFilterId) => {
    console.log('Selecting community filter', { filterId });
    setActiveFilter(filterId);
  }, []);

  const renderMembersCount = useCallback((members: number) => {
    return `${members.toLocaleString()} members`;
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B1120', Colors.gradient1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.heroOverlay} />
        <BackButton
          color={Colors.white}
          style={styles.backButton}
          testID="community-explorer-back"
        />
        <View style={styles.heroContent}>
          <Text style={styles.heroEyebrow}>Support Network</Text>
          <Text style={styles.heroTitle}>Find your accountability circle</Text>
          <Text style={styles.heroSubtitle}>
            Curated micro-communities led by trained facilitators.
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filtersContainer}>
          {COMMUNITY_FILTERS.map((filter) => {
            const isActive = filter.id === activeFilter;
            return (
              <TouchableOpacity
                key={filter.id}
                testID={`community-filter-${filter.id}`}
                onPress={() => handleSelectFilter(filter.id)}
                activeOpacity={0.8}
                style={[styles.filterChip, isActive ? styles.filterChipActive : styles.filterChipInactive]}
              >
                <Text style={[styles.filterChipLabel, isActive ? styles.filterChipLabelActive : styles.filterChipLabelInactive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.communityList}>
          {filteredCommunities.map((group) => (
            <TouchableOpacity
              key={group.id}
              testID={`community-card-${group.id}`}
              style={[styles.communityCard, cardShadow]}
              activeOpacity={0.88}
              onPress={() => {
                console.log('Viewing community detail', { communityId: group.id });
              }}
            >
              <Image source={{ uri: group.imageUrl }} style={styles.communityImage} />
              <View style={styles.communityCardContent}>
                <View style={styles.communityHeader}>
                  <Text style={styles.communityName}>{group.name}</Text>
                  <View style={styles.membersPill}>
                    <Users size={14} color={Colors.white} />
                    <Text style={styles.membersCount}>{renderMembersCount(group.members)}</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{group.meetingTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{group.format}</Text>
                  </View>
                </View>
                <Text style={styles.description}>{group.description}</Text>
                <View style={styles.tagsRow}>
                  {group.focusTags.map((tag) => (
                    <View key={tag} style={styles.tagPill}>
                      <Sparkles size={12} color={Colors.primary} />
                      <Text style={styles.tagLabel}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.facilitatorInfo}>
                    <Image
                      source={{ uri: group.facilitatorAvatar }}
                      style={styles.facilitatorAvatar}
                    />
                    <View style={styles.facilitatorTextGroup}>
                      <Text style={styles.facilitatorLabel}>Facilitated by</Text>
                      <Text style={styles.facilitatorName}>{group.featuredFacilitator}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    testID={`community-join-${group.id}`}
                    style={styles.joinButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      console.log('Requesting community invite', { communityId: group.id });
                    }}
                  >
                    <Text style={styles.joinButtonText}>Request invite</Text>
                    <ArrowRight size={16} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    position: 'relative',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: heroOverlay,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backButton: {
    marginBottom: 16,
    zIndex: 2,
  },
  heroContent: {
    zIndex: 2,
    gap: 10,
  },
  heroEyebrow: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 64,
    paddingHorizontal: 20,
    gap: 24,
    marginTop: -24,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterChip: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterChipInactive: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  filterChipLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipLabelInactive: {
    color: Colors.textSecondary,
  },
  filterChipLabelActive: {
    color: Colors.white,
  },
  communityList: {
    gap: 20,
  },
  communityCard: {
    backgroundColor: Colors.background,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.08)',
  },
  communityImage: {
    width: '100%',
    height: 160,
  },
  communityCardContent: {
    padding: 20,
    gap: 16,
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  communityName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  membersPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  membersCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  facilitatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  facilitatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  facilitatorTextGroup: {
    gap: 2,
  },
  facilitatorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  facilitatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: Colors.primary,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
});
