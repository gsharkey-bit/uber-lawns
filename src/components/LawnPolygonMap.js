import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, ActivityIndicator } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing } from '../theme/colors';
import { polygonAreaSquareFeet } from '../utils/geometry';
import { formatSqft } from '../utils/pricing';

/**
 * LawnPolygonMap — satellite map with two outline modes:
 *   mode="auto"   : show an auto-detected polygon (read-only)
 *   mode="manual" : let the user drag their finger to draw a polygon
 *
 * Pass `coordinate` to pan the map there (e.g. after address pick).
 * Pass `initialPolygon` to display an existing outline.
 */
const LawnPolygonMap = forwardRef(function LawnPolygonMap(props, ref) {
  const {
    coordinate,
    initialPolygon = [],
    mode = 'manual',
    onPolygonChange,
    loadingLabel,
  } = props;

  const [region, setRegion] = useState(null);
  const [polygon, setPolygon] = useState(initialPolygon);
  const mapRef = useRef(null);
  const drawingRef = useRef([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setPolygon([]);
      drawingRef.current = [];
      onPolygonChange?.([]);
    },
    setPolygon: (pts) => {
      setPolygon(pts);
      onPolygonChange?.(pts);
    },
  }), [onPolygonChange]);

  // Pan to the chosen address coordinate
  useEffect(() => {
    if (coordinate) {
      const r = {
        ...coordinate,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };
      setRegion(r);
      mapRef.current?.animateToRegion(r, 600);
    }
  }, [coordinate?.latitude, coordinate?.longitude]);

  // If we have neither coordinate nor a region yet, try to use device GPS
  useEffect(() => {
    if (region || coordinate) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setRegion({ latitude: 37.78925, longitude: -122.4344, latitudeDelta: 0.002, longitudeDelta: 0.002 });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.002, longitudeDelta: 0.002 });
      } catch {
        setRegion({ latitude: 37.78925, longitude: -122.4344, latitudeDelta: 0.002, longitudeDelta: 0.002 });
      }
    })();
  }, [region, coordinate]);

  // Sync incoming initialPolygon (e.g. after auto-detect)
  useEffect(() => {
    setPolygon(initialPolygon);
  }, [initialPolygon]);

  // PanResponder lets the user draw freehand when mode === 'manual'.
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'manual',
      onMoveShouldSetPanResponder: () => mode === 'manual',
      onPanResponderGrant: async (evt) => {
        drawingRef.current = [];
        await addPointFromEvent(evt);
      },
      onPanResponderMove: async (evt) => {
        await addPointFromEvent(evt);
      },
      onPanResponderRelease: () => {
        if (drawingRef.current.length >= 3) {
          // close the polygon
          drawingRef.current.push(drawingRef.current[0]);
        }
        setPolygon(drawingRef.current.slice());
        onPolygonChange?.(drawingRef.current.slice());
      },
    })
  ).current;

  async function addPointFromEvent(evt) {
    if (!mapRef.current) return;
    const { locationX, locationY } = evt.nativeEvent;
    try {
      const coord = await mapRef.current.coordinateForPoint({ x: locationX, y: locationY });
      const last = drawingRef.current[drawingRef.current.length - 1];
      if (last) {
        const dLat = (coord.latitude - last.latitude) * 111000;
        const dLng = (coord.longitude - last.longitude) * 85000;
        if (Math.hypot(dLat, dLng) < 0.4) return; // throttle
      }
      drawingRef.current.push(coord);
      setPolygon(drawingRef.current.slice());
    } catch {}
  }

  const sqft = polygonAreaSquareFeet(polygon);

  if (!region) {
    return (
      <View style={[styles.wrap, styles.centerWrap]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View {...(mode === 'manual' ? panResponder.panHandlers : {})} style={StyleSheet.absoluteFill}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          mapType="satellite"
          scrollEnabled={mode !== 'manual'}
          zoomEnabled={mode !== 'manual'}
          rotateEnabled={false}
        >
          {polygon.length >= 3 ? (
            <Polygon
              coordinates={polygon}
              strokeColor={colors.primary}
              fillColor="rgba(46,125,50,0.35)"
              strokeWidth={2}
            />
          ) : null}
        </MapView>
      </View>

      <View style={styles.banner} pointerEvents="none">
        <Text style={styles.bannerText}>
          {loadingLabel
            ? loadingLabel
            : mode === 'manual'
            ? polygon.length >= 3
              ? `Estimated area: ${formatSqft(sqft)}`
              : 'Drag your finger to outline the lawn'
            : polygon.length >= 3
            ? `Auto-measured: ${formatSqft(sqft)}`
            : 'Pick an address to begin'}
        </Text>
      </View>
    </View>
  );
});

export default LawnPolygonMap;

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  centerWrap: { alignItems: 'center', justifyContent: 'center' },
  banner: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  bannerText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});
