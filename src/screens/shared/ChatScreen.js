import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, SafeAreaView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobsContext';
import { colors, radii, spacing } from '../../theme/colors';

const REPLIES_FROM_MOWER = ["On my way!", "Be there in ~10.", "Got it.", "I'll bring the trimmer."];
const REPLIES_FROM_CUSTOMER = ["Sounds good, thanks!", "Take your time.", "Gate's unlocked.", "Just gave the dog water."];

export default function ChatScreen({ route }) {
  const { jobId } = route.params;
  const { user } = useAuth();
  const { jobs, sendChatMessage } = useJobs();
  const job = jobs.find((j) => j.id === jobId);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const messages = job?.chatMessages || [];
  const otherParty = user.role === 'customer' ? (job?.mowerName || 'Mower') : (job?.customerName || 'Customer');

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.length]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    sendChatMessage(jobId, user.role, t);
    setText('');
    // simulated auto-reply for the demo
    setTimeout(() => {
      const pool = user.role === 'customer' ? REPLIES_FROM_MOWER : REPLIES_FROM_CUSTOMER;
      sendChatMessage(jobId, user.role === 'customer' ? 'mower' : 'customer', pool[Math.floor(Math.random() * pool.length)]);
    }, 1100);
  };

  if (!job) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topbar}>
        <Text style={styles.who}>{otherParty}</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView
          ref={scrollRef}
          style={styles.body}
          contentContainerStyle={{ padding: spacing.md, gap: 6 }}
        >
          {messages.length === 0 ? (
            <Text style={styles.empty}>Say hello to start the conversation</Text>
          ) : messages.map((m, i) => (
            <View key={i} style={[styles.bubble, m.from === user.role ? styles.bubbleMe : styles.bubbleThem]}>
              <Text style={[styles.bubbleText, m.from === user.role && { color: '#fff' }]}>{m.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topbar: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  who: { fontWeight: '700', fontSize: 16, color: colors.text },
  body: { flex: 1 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40, fontStyle: 'italic' },
  bubble: { maxWidth: '78%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 18 },
  inputRow: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: {
    flex: 1, backgroundColor: '#F0F2F0', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: colors.text,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
