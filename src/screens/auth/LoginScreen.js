import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, radii, spacing } from '../../theme/colors';

export default function LoginScreen({ route, navigation }) {
  const role = route?.params?.role || 'customer';
  const { signInAsCustomer, signInAsMower } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const isCustomer = role === 'customer';

  const onSignIn = () => {
    const payload = { name: name.trim(), email: email.trim() };
    if (isCustomer) signInAsCustomer(payload);
    else signInAsMower(payload);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {isCustomer ? 'Sign in as a customer' : 'Sign in as a mower'}
          </Text>
          <Text style={styles.subtitle}>
            This prototype skips the password — tap continue to enter as a demo
            {isCustomer ? ' customer.' : ' mower.'}
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={isCustomer ? 'Avery Lin' : 'Jordan Hayes'}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PrimaryButton
              label={isCustomer ? 'Continue as customer' : 'Continue as mower'}
              onPress={onSignIn}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.lg },
  back: { paddingVertical: spacing.sm },
  backText: { color: colors.primary, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  subtitle: { color: colors.textMuted, marginTop: spacing.xs },
  form: { marginTop: spacing.lg },
  label: { color: colors.text, fontWeight: '600', marginBottom: 4, marginTop: spacing.md },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
});
