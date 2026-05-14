import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import LawnPolygonMap from '../../components/LawnPolygonMap';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing } from '../../theme/colors';
import { formatSqft } from '../../utils/pricing';

export default function LawnMeasureScreen({ navigation }) {
  const [area, setArea] = useState(0);
  const [coords, setCoords] = useState([]);

  const canContinue = area > 0 && coords.length >= 3;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Outline your lawn</Text>
        <Text style={styles.subtitle}>
          Tap each corner of the area you want mowed. We'll measure it for you.
        </Text>
      </View>

      <View style={styles.mapWrap}>
        <LawnPolygonMap
          onAreaChange={setArea}
          onCoordinatesChange={setCoords}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.areaPill}>
          <Text style={styles.areaLabel}>Area</Text>
          <Text style={styles.areaValue}>{formatSqft(area)}</Text>
        </View>
        <PrimaryButton
          label="Continue"
          disabled={!canContinue}
          onPress={() =>
            navigation.navigate('RequestJob', {
              squareFeet: area,
              coordinates: coords,
            })
          }
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  mapWrap: { flex: 1, marginHorizontal: spacing.lg, borderRadius: radii.md, overflow: 'hidden' },
  footer: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  areaPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  areaLabel: { fontSize: 11, color: colors.textMuted },
  areaValue: { fontWeight: '800', color: colors.text },
});
