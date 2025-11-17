import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Animated, LayoutChangeEvent, PanResponder, PanResponderGestureState, Platform } from 'react-native';
import TallyCard from './TallyCard';
import { Tally } from '../types/tally';

interface DraggableTalliesListProps {
  tallies: Tally[];
  onOrderCommit: (orderedIds: string[]) => void;
}

interface DragState {
  id: string;
  initialY: number;
  height: number;
  hasReordered: boolean;
}

interface ItemLayout {
  top: number;
  height: number;
}

export default function DraggableTalliesList({ tallies, onOrderCommit }: DraggableTalliesListProps) {
  const [orderedTallies, setOrderedTallies] = useState<Tally[]>(tallies);
  const orderedTalliesRef = useRef<Tally[]>(tallies);
  const layoutsRef = useRef<Record<string, ItemLayout>>({});
  const dragY = useRef(new Animated.Value(0)).current;
  const dragStateRef = useRef<DragState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    orderedTalliesRef.current = orderedTallies;
  }, [orderedTallies]);

  useEffect(() => {
    setOrderedTallies((prev) => {
      const incomingMap = new Map<string, Tally>();
      tallies.forEach((tally) => incomingMap.set(tally.id, tally));
      const filtered = prev.filter((item) => incomingMap.has(item.id)).map((item) => incomingMap.get(item.id) as Tally);
      const existingIds = new Set(filtered.map((item) => item.id));
      const appended = tallies.filter((item) => !existingIds.has(item.id));
      const nextOrder = [...filtered, ...appended];
      orderedTalliesRef.current = nextOrder;
      return nextOrder;
    });
  }, [tallies]);

  const handleLayout = useCallback((id: string, event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    layoutsRef.current[id] = { top: y, height };
    if (dragStateRef.current && dragStateRef.current.id === id) {
      dragStateRef.current = { ...dragStateRef.current, height };
    }
  }, []);

  const commitOrder = useCallback(() => {
    const ids = orderedTalliesRef.current.map((item) => item.id);
    onOrderCommit(ids);
  }, [onOrderCommit]);

  const animateToPosition = useCallback((id: string) => {
    const layout = layoutsRef.current[id];
    if (!layout) {
      setActiveId(null);
      dragStateRef.current = null;
      return;
    }
    Animated.spring(dragY, {
      toValue: layout.top,
      useNativeDriver: false,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    }).start(() => {
      dragY.setValue(0);
      setActiveId(null);
      dragStateRef.current = null;
    });
  }, [dragY]);

  const updateOrderForDrag = useCallback((id: string, gestureY: number) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.id !== id) {
      return;
    }
    const layout = layoutsRef.current[id];
    if (!layout) {
      return;
    }

    const nextY = dragState.initialY + gestureY;
    dragY.setValue(nextY);

    const dragMid = nextY + dragState.height / 2;
    const list = orderedTalliesRef.current;
    let newIndex = 0;

    for (let index = 0; index < list.length; index += 1) {
      const item = list[index];
      if (item.id === id) {
        continue;
      }
      const itemLayout = layoutsRef.current[item.id];
      if (!itemLayout) {
        continue;
      }
      if (dragMid > itemLayout.top + itemLayout.height / 2) {
        newIndex = index + 1;
      }
    }

    const currentIndex = list.findIndex((item) => item.id === id);
    if (currentIndex === -1 || currentIndex === newIndex) {
      return;
    }

    const reordered = [...list];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);
    orderedTalliesRef.current = reordered;
    dragStateRef.current = { ...dragState, hasReordered: true };
    setOrderedTallies(reordered);
  }, [dragY]);

  const handleDragStart = useCallback((id: string) => {
    const layout = layoutsRef.current[id];
    if (!layout) {
      return;
    }
    dragStateRef.current = {
      id,
      initialY: layout.top,
      height: layout.height,
      hasReordered: false,
    };
    dragY.setValue(layout.top);
    setActiveId(id);
  }, [dragY]);

  const handleDragEnd = useCallback((id: string, gesture: PanResponderGestureState) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.id !== id) {
      return;
    }

    if (dragState.hasReordered) {
      commitOrder();
    }

    animateToPosition(id);
  }, [animateToPosition, commitOrder]);

  const createPanResponder = useCallback((id: string) => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 8,
    onPanResponderGrant: () => {
      handleDragStart(id);
    },
    onPanResponderMove: (_, gestureState) => {
      updateOrderForDrag(id, gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      handleDragEnd(id, gestureState);
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderTerminate: (_, gestureState) => {
      handleDragEnd(id, gestureState);
    },
  }), [handleDragStart, handleDragEnd, updateOrderForDrag]);

  const responderMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof PanResponder.create>> = {};
    orderedTallies.forEach((item) => {
      map[item.id] = createPanResponder(item.id);
    });
    return map;
  }, [orderedTallies, createPanResponder]);

  const activeLayout = activeId ? layoutsRef.current[activeId] : undefined;
  const activeTally = activeId ? orderedTalliesRef.current.find((item) => item.id === activeId) : undefined;
  const shouldRenderOverlay = Boolean(activeId && activeLayout && activeTally);

  return (
    <View style={styles.wrapper}>
      {orderedTallies.map((tally) => {
        const isActive = activeId === tally.id;
        const layout = layoutsRef.current[tally.id];
        const placeholderHeight = isActive ? layout?.height ?? 0 : undefined;
        return (
          <View
            key={tally.id}
            style={styles.itemContainer}
            onLayout={(event) => handleLayout(tally.id, event)}
            {...responderMap[tally.id]?.panHandlers}
          >
            {isActive ? (
              <View style={[styles.placeholder, placeholderHeight ? { height: placeholderHeight } : undefined]} />
            ) : (
              <TallyCard tally={tally} />
            )}
          </View>
        );
      })}

      {shouldRenderOverlay && activeId && activeTally ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.dragOverlay,
            {
              top: dragY,
              transform: [
                {
                  scale: Platform.select({ default: 1, ios: 1.02, android: 1.02 }) ?? 1,
                },
              ],
            },
          ]}
        >
          <View style={styles.overlayShadow}>
            <TallyCard tally={activeTally} />
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    gap: 20,
  },
  itemContainer: {
    position: 'relative',
  },
  placeholder: {
    borderRadius: 24,
    backgroundColor: 'rgba(99,102,241,0.16)',
    opacity: 0,
  },
  dragOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 50,
  },
  overlayShadow: {
    shadowColor: '#4C1D95',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 16,
  },
});
