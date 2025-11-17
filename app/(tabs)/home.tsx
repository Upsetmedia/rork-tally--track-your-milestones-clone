import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings as SettingsIcon, Plus, Hammer } from 'lucide-react-native';
import Colors from '../../constants/colors';
import { useTallies } from '../../contexts/tallies';
import DraggableTalliesList from '../../components/DraggableTalliesList';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tallies, reorderTallies } = useTallies();

  const handleAddTally = useCallback(() => {
    console.log('Home: add tally pressed');
    router.push('/add-tally');
  }, [router]);

  const handleOpenToolbox = useCallback(() => {
    console.log('Home: toolbox pressed');
    router.push('/toolbox');
  }, [router]);

  const handleOpenSettings = useCallback(() => {
    console.log('Home: settings pressed');
    router.push('/(tabs)/settings');
  }, [router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.gradient1, Colors.gradient2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <Text testID="home-header-title" style={styles.headerTitle}>
            Tally
          </Text>
          <View style={styles.headerActions}>
            <View style={styles.toolboxWrapper}>
              <TouchableOpacity
                testID="home-toolbox-button"
                style={styles.toolboxButton}
                onPress={handleOpenToolbox}
                activeOpacity={0.7}
              >
                <Hammer size={20} color={Colors.white} />
                <Text style={styles.toolboxLabel}>ToolBox</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              testID="home-settings-button"
              style={styles.headerActionButton}
              onPress={handleOpenSettings}
              activeOpacity={0.7}
            >
              <SettingsIcon size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 160 }]}
      >
        {tallies.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧭</Text>
            <Text style={styles.emptyTitle}>Create your first tracker</Text>
            <Text style={styles.emptyCopy}>Every tracker lives in its own button. Add one to get started.</Text>
            <TouchableOpacity
              testID="home-empty-state-add-button"
              style={styles.emptyAction}
              onPress={handleAddTally}
              activeOpacity={0.8}
            >
              <Plus size={18} color={Colors.white} />
              <Text style={styles.emptyActionText}>Add tracker</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tallyListWrapper}>
            <DraggableTalliesList tallies={tallies} onOrderCommit={reorderTallies} />
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        testID="home-floating-add-button"
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={handleAddTally}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#6366F1', '#4338CA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Plus size={26} color={Colors.white} strokeWidth={3} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F2FF',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolboxWrapper: {
    position: 'relative',
  },
  toolboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },

  toolboxLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },

  headerActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
    gap: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.18)',
  },
  emptyEmoji: {
    fontSize: 52,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#312E81',
    textAlign: 'center',
  },
  emptyCopy: {
    fontSize: 15,
    color: 'rgba(79,70,229,0.8)',
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  emptyActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  tallyListWrapper: {
    gap: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    borderRadius: 36,
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.32)',
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
