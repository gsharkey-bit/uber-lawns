import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/colors';
import { searchAddresses, getPlaceDetails } from '../services/places';

/**
 * AddressAutocomplete — Google Places-style address search.
 * Calls onSelect with { label, coordinate, layout?, estimatedArea? } once
 * the user picks a suggestion. Works offline with preset addresses if no
 * API key is configured.
 */
export default function AddressAutocomplete({ onSelect, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (picked) return;
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const r = await searchAddresses(query);
      setResults(r);
      setLoading(false);
    }, 220);
    return () => clearTimeout(debounceRef.current);
  }, [query, picked]);

  const pick = async (item) => {
    setPicked(true);
    setQuery(item.label);
    setResults([]);
    if (item.coordinate) {
      onSelect(item);
    } else {
      // Need to fetch details for the lat/lng
      setLoading(true);
      const details = await getPlaceDetails(item.placeId);
      setLoading(false);
      if (details) onSelect({ ...item, ...details });
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setPicked(false);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.inputRow}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(t) => { setQuery(t); setPicked(false); }}
          placeholder="Search address"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={clear} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
        {loading ? <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 6 }} /> : null}
      </View>

      {results.length > 0 ? (
        <View style={styles.dropdown}>
          {results.map((item) => (
            <TouchableOpacity key={item.placeId} style={styles.row} onPress={() => pick(item)}>
              <Ionicons name="location" size={16} color={colors.textMuted} />
              <Text style={styles.rowLabel} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 4,
  },
  icon: { marginRight: 6 },
  input: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 },
  dropdown: {
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, marginTop: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F2F0',
  },
  rowLabel: { flex: 1, color: colors.text, fontSize: 14 },
});
