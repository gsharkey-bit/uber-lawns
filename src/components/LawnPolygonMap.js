import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/colors';
import { polygonAreaSquareFeet } from '../utils/geometry';
import { formatSqft } from '../utils/pricing';

/**
 * LawnPolygonMap — tap to drop polygon vertices on a satellite map.
 * The polygon's square footage is reported back via onAreaChange.
 *
 * Requires a Google Maps API key set in app.json (ios.config.googleMapsApiKey
 * and android.config.googleMaps.apiKey). Without a key it will still render
 * but tiles will not load.
 */
export default function LawnPolygonMap({ initialRegion, onAreaChange, onCoordinatesChange }) {
  const [coords, setCoords] = useState([]);
  const [region, setRegion] = useState(initialRegion);
  const mapRef = useRef(null);

  // Try to center on the device's location on mount.
  useEffect(() => {
    if (region) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setRegion({
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        });
      } catch (e) {
        setRegion({
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        });
      }
    })();
  }, [region]);

  const handleMapPress = (e) => {
    const next = [...coords, e.nativeEvent.coordinate];
    updateCoords(next);
  };

  const updateCoords = (next) => {
    setCoords(next);
    const area = polygonAreaSquareFeet(next);
    onAreaChange?.(area);
    onCoordinatesChange?.(next);
  };

  const undo = () => updateCoords(coords.slice(0, -1));
  const clear = () => updateCoords([]);

  const sqft = polygonAreaSquareFeet(coords);

  if (!region) {
    return (
      <View style={[styles.wrap, styles.loadingWrap]}>
        <Text style={styles.loading}>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        mapType="satellite"
        onPress={handleMapPress}
        showsUserLocation
      >
        {coords.length > 0 && (
          <Polygon
            coordinates={coords}
            strokeColor={colors.primary}
            fillColor="rgba(46,125,50,0.35)"
            strokeWidth={2}
          />
        )}
        {coords.map((c, i) => (
          <Marker
            key={`${c.latitude}-${c.longitude}-${i}`}
            coordinate={c}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.vertex} />
          </Marker>
        ))}
      </MapView>

      <View style={styles.banner} pointerEvents="none">
        <Text style={styles.bannerText}>
          {coords.length < 3
            ? 'Tap the map to outline your lawn'
            : `Estimated area: ${formatSqft(sqft)}`}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.ctrl} onPress={undo} disabled={coords.length === 0}>
          <Ionicons name="arrow-undo" size={18} color={colors.text} />
          <Text style={styles.ctrlLabel}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrl} onPress={clear} disabled={coords.length === 0}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
          <Text style={[styles.ctrlLabel, { color: colors.danger }]}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  loadingWrap: { alignItems: 'center', justifyContent: 'center' },
  loading: { color: '#fff' },
  vertex: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
  },
  banner: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  bannerText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  controls: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    gap: spacing.xs,
  },
  ctrl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  ctrlLabel: { fontWeight: '700', color: colors.text },
});
