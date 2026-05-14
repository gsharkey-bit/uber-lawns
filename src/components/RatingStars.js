import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * RatingStars — read-only display (size, value) or interactive picker
 * when onChange is provided.
 */
export default function RatingStars({ value = 0, size = 18, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <View style={styles.row}>
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        const Icon = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={colors.star}
          />
        );
        if (onChange) {
          return (
            <TouchableOpacity key={n} onPress={() => onChange(n)} hitSlop={6}>
              {Icon}
            </TouchableOpacity>
          );
        }
        return <View key={n}>{Icon}</View>;
      })}
      {!onChange && value > 0 ? (
        <Text style={[styles.label, { fontSize: size * 0.8 }]}>
          {value.toFixed(1)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  label: { marginLeft: 6, color: colors.textMuted, fontWeight: '600' },
});
