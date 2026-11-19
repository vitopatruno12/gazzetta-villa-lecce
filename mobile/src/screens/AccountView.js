import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiPost } from '../api';
import { COLORS, SANS, SERIF } from '../theme';

const EMPTY_REG = {
  first_name: '',
  last_name: '',
  company_name: '',
  vat_number: '',
  city: '',
  address: '',
  email: '',
  password: '',
};

const PROFILE_FIELDS = [
  ['first_name', 'Nome'],
  ['last_name', 'Cognome'],
  ['company_name', 'Ragione sociale'],
  ['vat_number', 'Partita IVA'],
  ['city', 'Città'],
  ['address', 'Indirizzo'],
  ['email', 'Email'],
];

export default function AccountView({
  session,
  initialMode = 'login',
  onLoginSuccess,
  onLogout,
}) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reg, setReg] = useState(EMPTY_REG);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (session?.user) {
    const u = session.user;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.kicker}>Area Cliente</Text>
        <Text style={styles.heading}>Il tuo profilo</Text>
        <Text style={styles.lead}>
          {[u.first_name, u.last_name].filter(Boolean).join(' ') || u.name}
        </Text>

        <View style={styles.profileBox}>
          {PROFILE_FIELDS.map(([key, label], idx) => (
            <View
              key={key}
              style={[
                styles.profileRow,
                idx === PROFILE_FIELDS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Text style={styles.profileLabel}>{label}</Text>
              <Text style={styles.profileValue}>{u[key] || '—'}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.submitBtn} onPress={onLogout}>
          <Text style={styles.submitBtnText}>Esci</Text>
        </Pressable>
      </ScrollView>
    );
  }

  async function handleLogin() {
    setError('');
    setPending(true);
    try {
      const res = await apiPost('/api/auth/login', { email: email.trim(), password });
      if (res?.user?.role !== 'cliente') {
        setError('Questo accesso è riservato ai clienti. Usa il modulo di registrazione.');
        return;
      }
      onLoginSuccess(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }

  async function handleRegister() {
    setError('');
    setPending(true);
    try {
      const res = await apiPost('/api/auth/register', reg);
      onLoginSuccess(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {mode === 'login' ? (
        <View>
          <Text style={styles.kicker}>Area Cliente</Text>
          <Text style={styles.heading}>Login</Text>
          <Text style={styles.lead}>Inserisci le tue credenziali per accedere al tuo profilo.</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="nome@azienda.it"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.submitBtn} onPress={handleLogin} disabled={pending}>
            {pending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.switchNote}>
            <Text style={styles.switchNoteText}>Non sei ancora registrato? </Text>
            <Pressable
              onPress={() => {
                setError('');
                setMode('register');
              }}
            >
              <Text style={styles.switchNoteLink}>Registrati</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.kicker}>Registrazione</Text>
          <Text style={styles.heading}>Modulo di registrazione</Text>
          <Text style={styles.lead}>Registrati con i dati della tua attività.</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={reg.first_name}
            onChangeText={(v) => setReg((c) => ({ ...c, first_name: v }))}
          />

          <Text style={styles.label}>Cognome</Text>
          <TextInput
            style={styles.input}
            value={reg.last_name}
            onChangeText={(v) => setReg((c) => ({ ...c, last_name: v }))}
          />

          <Text style={styles.label}>Ragione sociale</Text>
          <TextInput
            style={styles.input}
            value={reg.company_name}
            onChangeText={(v) => setReg((c) => ({ ...c, company_name: v }))}
          />

          <Text style={styles.label}>Partita IVA (11 cifre)</Text>
          <TextInput
            style={styles.input}
            value={reg.vat_number}
            onChangeText={(v) => setReg((c) => ({ ...c, vat_number: v }))}
            keyboardType="number-pad"
            maxLength={11}
          />

          <Text style={styles.label}>Città</Text>
          <TextInput
            style={styles.input}
            value={reg.city}
            onChangeText={(v) => setReg((c) => ({ ...c, city: v }))}
          />

          <Text style={styles.label}>Indirizzo</Text>
          <TextInput
            style={styles.input}
            value={reg.address}
            onChangeText={(v) => setReg((c) => ({ ...c, address: v }))}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={reg.email}
            onChangeText={(v) => setReg((c) => ({ ...c, email: v.trim() }))}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password (min. 6 caratteri)</Text>
          <TextInput
            style={styles.input}
            value={reg.password}
            onChangeText={(v) => setReg((c) => ({ ...c, password: v }))}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.submitBtn} onPress={handleRegister} disabled={pending}>
            {pending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Registrati</Text>
            )}
          </Pressable>

          <View style={styles.switchNote}>
            <Text style={styles.switchNoteText}>Hai già un profilo? </Text>
            <Pressable
              onPress={() => {
                setError('');
                setMode('login');
              }}
            >
              <Text style={styles.switchNoteLink}>Torna al Login</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  kicker: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.red,
    marginBottom: 3,
  },
  heading: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.ink,
    marginBottom: 6,
  },
  lead: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 15,
    color: COLORS.muted,
    marginBottom: 14,
  },
  label: {
    fontFamily: SANS,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: COLORS.ink,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 15,
    color: COLORS.ink,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 13,
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.ink,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  switchNote: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 16,
  },
  switchNoteText: {
    fontFamily: SERIF,
    fontSize: 15,
    color: COLORS.muted,
  },
  switchNoteLink: {
    fontFamily: SERIF,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.red,
    textDecorationLine: 'underline',
  },
  profileBox: {
    borderWidth: 1,
    borderColor: COLORS.rule,
    backgroundColor: '#ffffff',
  },
  profileRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rule,
  },
  profileLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.muted,
  },
  profileValue: {
    fontFamily: SERIF,
    fontSize: 16,
    color: COLORS.ink,
    marginTop: 2,
  },
});
