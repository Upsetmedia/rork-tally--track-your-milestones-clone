import React, { memo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/colors';

interface BackButtonProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: () => void;
  testID?: string;
}

function BackButtonComponent({
  color = Colors.text,
  style,
  textStyle,
  onPress,
  testID,
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = useCallback(() => {
    console.log('[BackButton] pressed');
    if (onPress) {
      onPress();
      return;
    }
    router.back();
  }, [onPress, router]);

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.touchable, style]}
    >
      <Text style={[styles.label, { color }, textStyle]}>{'<'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 28,
    fontWeight: '700',
  },
});

export default memo(BackButtonComponent);
