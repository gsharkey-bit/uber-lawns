import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../theme/colors';

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
}) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        isOutline && styles.btnOutline,
        isDanger && styles.btnDanger,
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : '#fff'} />
      ) : (
        <Text
          style={[
            styles.label,
            isOutline && styles.labelOutline,
            isDanger && styles.labelDanger,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnDanger: { backgroundColor: colors.danger },
  btnDisabled: { opacity: 0.5 },
  label: { color: '#fff', fontSize: 16, fontWeight: '700' },
  labelOutline: { color: colors.primary },
  labelDanger: { color: '#fff' },
});
