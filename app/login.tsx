import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../api';

const API_URL = 'https://apifastpi-production.up.railway.app';

type LoginFormData = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginProps = {
  status?: string;
  canResetPassword?: boolean;
};

export default function Login({ status }: LoginProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [processing, setProcessing] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async () => {
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.email) newErrors.email = 'Email es requerido';
    if (!formData.password) newErrors.password = 'Contraseña es requerida';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setProcessing(true);

    try {
      const user = await login(formData.email, formData.password);
      console.log('Login exitoso:', user);

      const userId = user.usuario?.id_usuario || user.id;
      const userType = user.usuario?.tipo || user.tipo;

      await AsyncStorage.setItem('user_id', String(userId));

      if (userType === 'atleta') {
        const res = await fetch(`${API_URL}/atletas/usuario/${userId}`);
        if (!res.ok) {
          const raw = await res.text();
          console.error('Respuesta no OK atleta:', raw);
          throw new Error('No se pudo obtener el perfil del atleta');
        }

        const atleta = await res.json();
        await AsyncStorage.setItem('atleta_id', String(atleta.id_atleta));
        router.replace('/(tabs)/DashboardAtleta');
      } else if (userType === 'entrenador') {
        router.replace('/coach/DashboardCoach');
      } else {
        throw new Error('Tipo de usuario no reconocido');
      }

    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      setErrors({ password: error.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>SPM</Text>
          <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
          <View style={styles.divider} />
        </View>

        {status && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu correo electrónico"
              placeholderTextColor="#747474ff"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor="#747474ff"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          </View>

          <View style={styles.rememberContainer}>
            <Switch
              value={formData.remember}
              onValueChange={(value) => handleChange('remember', value)}
              trackColor={{ false: '#767577', true: '#f97316' }}
              thumbColor={formData.remember ? '#fff' : '#f4f3f4'}
            />
            <Text style={styles.rememberText}>Recuérdame</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.button, processing && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={processing}
            >
              <Text style={styles.buttonText}>
                {processing ? 'Procesando...' : 'INICIAR SESIÓN'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B00',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    marginTop: 8,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#FF6B00',
    marginVertical: 12,
  },
  formContainer: {
    backgroundColor: '#111111',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  inputGroup: {
    marginTop: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#CCCCCC',
    marginBottom: 6,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: '#333333',
    borderLeftColor: '#333333',
    borderRightColor: '#333333',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
    borderRadius: 4,
    padding: 14,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  rememberContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 13,
    color: '#CCCCCC',
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  actionsContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FF6B00',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#fb923c',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#f97316',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});