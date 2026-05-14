import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';
import { TIERS, estimatePrice, formatUsd } from '../utils/pricing';

/**
 * Horizontal tier picker that shows estimated price for each tier
 * given the lawn's square footage. Lawn Black is highlighted with
 * a purple chip to mimic Uber Black.
 */
export default function PriceTierSelector({ squareFeet, value, onChange }) {
  const items = Object.values(TIERS);
  return (
    <View style={styles.wrap}>
      {items.map((tier) => {
        const selected = value === tier.id;
        const price = estimatePrice(squareFeet, tier.id);
        const isBlack = tier.id === 'black';
        return (
          <TouchableOpacity
            key={tier.id}
            style={[
              styles.card,
              selected && styles.cardSelected,
              isBlack && styles.cardBlack,
              isBlack && selected && styles.cardBlackSelected,
            ]}
            onPress={() => onChange(tier.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tierLabel,
                isBlack && { color: colors.proPurple },
                selected && !isBlack && { color: colors.primaryDark },
              ]}
            >
              {tier.label}
            </Text>
            <Text style={styles.price}>{formatUsd(price)}</Text>
            <Text style={styles.desc}>{tier.description}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#EFF7EF',
  },
  cardBlack: {
    borderColor: '#D1C4E9',
  },
  cardBlackSelected: {
    borderColor: colors.proPurple,
    backgroundColor: '#F3E5F5',
  },
  tierLabel: { fontSize: 13, fontWeight: '700', color: colors.text },
  price: { fontSize: 18, fontWeight: '800', marginTop: 4, color: colors.text },
  desc: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
