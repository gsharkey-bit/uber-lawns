import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddressAutocomplete from '../../components/AddressAutocomplete';
import LawnPolygonMap from '../../components/LawnPolygonMap';
import PrimaryButton from '../../components/PrimaryButton';
import { polygonAreaSquareFeet } from '../../utils/geometry';
import { formatSqft } from '../../utils/pricing';
import { autoDetectLawn } from '../../services/autoDetect';
import { colors, radii, spacing } from '../../theme/colors';

export default function LawnMeasureScreen({ navigation }) {
  const [address, setAddress] = useState(null);
  const [polygon, setPolygon] = useState([]);
  const [mode, setMode] = useState('auto');
  const [detecting, setDetecting] = useState(false);
  const [source, setSource] = useState(null);
  const mapRef = useRef(null);

  const area = polygonAreaSquareFeet(polygon);
  const canContinue = polygon.length >= 3 && address;

  const onAddressPick = async (a) => {
    setAddress(a);
    setPolygon([]);
    setSource(null);
    runAutoDetect(a);
  };

  const runAutoDetect = async (a = address) => {
    if (!a) return;
    setDetecting(true);
    setMode('auto');
    try {
      const result = await autoDetectLawn({
        coordinate: a.coordinate,
        estimatedArea: a.estimatedArea || 3000,
      });
      setPolygon(result.coordinates);
      setSource('auto');
    } catch {
      Alert.alert('Auto-detect failed', 'You can outline the lawn manually instead.');
    } finally {
      setDetecting(false);
    }
  };

  const switchToManual = () => {
    setMode('manual');
    setSource('manual');
    mapRef.current?.clear();
    setPolygon([]);
  };

  const onContinue = () => {
    navigation.navigate('Schedule', {
      squareFeet: Math.round(area),
      polygon,
      address: address.label,
      coordinate: address.coordinate,
      measurementSource: source,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Measure your lawn</Text>
        <Text style={styles.subtitle}>
          Type your address — we'll measure it from above. Or draw it manually.
        </Text>
      </View>

      <View style={styles.searchWrap}>
        <AddressAutocomplete
          initialValue={address?.label || ''}
          onSelect={onAddressPick}
        />
      </View>

      {address ? (
        <>
          <View style={styles.modeRow}>
            <ModeButton
              label="Auto-detect"
              icon="scan"
              active={mode === 'auto'}
              onPress={() => runAutoDetect()}
            />
            <ModeButton
              label="Draw manually"
              icon="pencil"
              active={mode === 'manual'}
              onPress={switchToManual}
            />
          </View>

          <View style={styles.mapWrap}>
            <LawnPolygonMap
              ref={mapRef}
              coordinate={address.coordinate}
              initialPolygon={polygon}
              mode={mode}
              onPolygonChange={setPolygon}
              loadingLabel={detecting ? 'Scanning your property…' : null}
            />
          </View>

          <View style={styles.footer}>
            <View style={styles.areaPill}>
              <Text style={styles.areaLabel}>Area</Text>
              <Text style={styles.areaValue}>{formatSqft(area || 0)}</Text>
            </View>
            <PrimaryButton
              label="Continue"
              disabled={!canContinue}
              onPress={onContinue}
              style={{ flex: 1 }}
            />
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="search-circle" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            Start by typing your address above.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function ModeButton({ label, icon, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.modeBtn, active && styles.modeBtnActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={16} color={active ? '#fff' : colors.text} />
      <Text style={[styles.modeBtnLabel, active && { color: '#fff' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.textMuted, marginTop: 4 },
  searchWrap: { paddingHorizontal: spacing.lg },
  modeRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.surface, paddingVertical: 10, borderRadius: radii.pill,
    borderWidth: 1, borderColor: colors.border,
  },
  modeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeBtnLabel: { fontWeight: '600', color: colors.text, fontSize: 13 },
  mapWrap: { flex: 1, marginHorizontal: spacing.lg, borderRadius: radii.md, overflow: 'hidden' },
  footer: { padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  areaPill: {
    backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 10,
    borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border,
  },
  areaLabel: { fontSize: 11, color: colors.textMuted },
  areaValue: { fontWeight: '800', color: colors.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyText: { color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
});
