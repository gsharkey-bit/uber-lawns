import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, PanResponder, ActivityIndicator } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, radii, spacing } from '../theme/colors';
import { lawnArea } from '../services/autoDetect';
import { formatSqft } from '../utils/pricing';

/**
 * LawnPolygonMap — satellite map for lawn outline.
 *
 * Modes:
 *   - 'manual'  : drag finger to draw polygon freehand
 *   - 'adjust'  : auto-detected polygon with draggable corner handles
 *   - 'view'    : read-only display
 *
 * Polygon can be a flat list of coords OR { coordinates, holes } for the
 * lot-minus-building shape.
 */
const LawnPolygonMap = forwardRef(function LawnPolygonMap(props, ref) {
  const {
    coordinate,
    initialPolygon = [],
    initialHoles = [],
    mode = 'manual',
    onPolygonChange,
    loadingLabel,
  } = props;

  const [region, setRegion] = useState(null);
  const [polygon, setPolygon] = useState(initialPolygon);
  const [holes, setHoles] = useState(initialHoles);
  const mapRef = useRef(null);
  const drawingRef = useRef([]);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setPolygon([]); setHoles([]); drawingRef.current = [];
      onPolygonChange?.([], []);
    },
    setPolygon: (pts, hls = []) => {
      setPolygon(pts); setHoles(hls);
      onPolygonChange?.(pts, hls);
    },
  }), [onPolygonChange]);

  useEffect(() => {
    if (coordinate) {
      const r = { ...coordinate, latitudeDelta: 0.0008, longitudeDelta: 0.0008 };
      setRegion(r);
      mapRef.current?.animateToRegion(r, 600);
    }
  }, [coordinate?.latitude, coordinate?.longitude]);

  useEffect(() => {
    if (region || coordinate) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setRegion({ latitude: 37.78925, longitude: -122.4344, latitudeDelta: 0.001, longitudeDelta: 0.001 });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setRegion({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: 0.001, longitudeDelta: 0.001 });
      } catch {
        setRegion({ latitude: 37.78925, longitude: -122.4344, latitudeDelta: 0.001, longitudeDelta: 0.001 });
      }
    })();
  }, [region, coordinate]);

  useEffect(() => {
    setPolygon(initialPolygon);
    setHoles(initialHoles);
  }, [initialPolygon, initialHoles]);

  // Freehand drawing via PanResponder (manual mode only)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'manual',
      onMoveShouldSetPanResponder: () => mode === 'manual',
      onPanResponderGrant: (evt) => { drawingRef.current = []; addPointFromEvent(evt); },
      onPanResponderMove: (evt) => addPointFromEvent(evt),
      onPanResponderRelease: () => {
        if (drawingRef.current.length >= 3) drawingRef.current.push(drawingRef.current[0]);
        setPolygon(drawingRef.current.slice());
        setHoles([]);
        onPolygonChange?.(drawingRef.current.slice(), []);
      },
    })
  ).current;

  async function addPointFromEvent(evt) {
    if (!mapRef.current) return;
    const { locationX, locationY } = evt.nativeEvent;
    try {
      const c = await mapRef.current.coordinateForPoint({ x: locationX, y: locationY });
      const last = drawingRef.current[drawingRef.current.length - 1];
      if (last) {
        const dLat = (c.latitude - last.latitude) * 111000;
        const dLng = (c.longitude - last.longitude) * 85000;
        if (Math.hypot(dLat, dLng) < 0.4) return;
      }
      drawingRef.current.push(c);
      setPolygon(drawingRef.current.slice());
    } catch {}
  }

  const onDragVertex = (idx) => (e) => {
    const next = polygon.slice();
    next[idx] = e.nativeEvent.coordinate;
    setPolygon(next);
    onPolygonChange?.(next, holes);
  };

  const sqft = lawnArea(polygon, holes);

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
              holes={holes && holes.length ? holes : undefined}
              strokeColor={colors.primary}
              fillColor="rgba(46,125,50,0.35)"
              strokeWidth={2}
            />
          ) : null}
          {mode === 'adjust' && polygon.length >= 3
            ? polygon.map((p, i) => (
                <Marker
                  key={`v-${i}`}
                  coordinate={p}
                  draggable
                  onDragEnd={onDragVertex(i)}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.handle} />
                </Marker>
              ))
            : null}
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
            : mode === 'adjust'
            ? polygon.length >= 3
              ? `Auto-detected: ${formatSqft(sqft)} · drag corners to adjust`
              : 'Pick an address to begin'
            : polygon.length >= 3
            ? formatSqft(sqft)
            : ''}
        </Text>
      </View>
    </View>
  );
});

export default LawnPolygonMap;

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: radii.md, overflow: 'hidden', backgroundColor: '#000' },
  centerWrap: { alignItems: 'center', justifyContent: 'center' },
  banner: {
    position: 'absolute', top: spacing.md, left: spacing.md, right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)', padding: spacing.sm, borderRadius: radii.sm,
  },
  bannerText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  handle: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary, borderWidth: 3, borderColor: '#fff',
  },
});
