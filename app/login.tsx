import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../api';

type LoginFormData = {
  email: string;
  password: string;
  remember: boolean;
};

type LoginProps = {
  status?: string;
  canResetPassword?: boolean;
};

export default function Login({ status, canResetPassword }: LoginProps) {
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

    // Redirige según el tipo de usuario
    if (userType === 'atleta') {
      const res = await fetch(`http://localhost:8000/atletas/usuario/${userId}`);
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {status && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}

        <Text style={styles.title}>SPM</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu contraseña"
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
                {processing ? 'Procesando...' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botón para registrar una nueva cuenta */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')} // Asegúrate que esta ruta existe
          >
            <Text style={styles.registerText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#f97316',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fb923c',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontSize: 14,
    color: '#4b5563',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPassword: {
    color: '#f97316',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#fb923c',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
