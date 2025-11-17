import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../constants/colors';

interface ConfettiBurstProps {
  visible: boolean;
}

interface ConfettiPiece {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  drift: number;
}

const CONFETTI_COLORS = ['#F9C74F', '#F8961E', '#90BE6D', '#577590', '#F3722C', '#F94144'];

export default function ConfettiBurst({ visible }: ConfettiBurstProps) {
  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: 18 }).map((_, index) => ({
      id: index,
      left: Math.random(),
      size: 6 + Math.random() * 8,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      delay: Math.random() * 180,
      drift: (Math.random() - 0.5) * 160,
    }));
  }, []);

  const animations = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      animations.forEach((animation) => {
        animation.setValue(0);
      });

      Animated.stagger(
        50,
        animations.map((animation, index) =>
          Animated.timing(animation, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
            delay: pieces[index].delay,
          })
        )
      ).start();
    }
  }, [animations, pieces, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.container} testID="confetti-burst-overlay">
      {pieces.map((piece, index) => {
        const translateY = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [-40, 320],
        });
        const translateX = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, piece.drift],
        });
        const rotate = animations[index].interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '420deg'],
        });
        const opacity = animations[index].interpolate({
          inputRange: [0, 0.15, 0.85, 1],
          outputRange: [0, 1, 0.7, 0],
        });

        return (
          <Animated.View
            key={piece.id}
            style={[
              styles.piece,
              {
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size * 2,
                left: `${piece.left * 100}%`,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
