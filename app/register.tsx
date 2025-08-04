import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { registrar } from '../api';

const API_URL = 'http://192.168.68.102:8000'; // ✅ Usa tu IP local aquí
//const API_URL = 'http://localhost:8000';  aca usas el que estes usando en tu entorno de desarrollo

type FormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  tipo: string;
  fecha_nacimiento?: string;
  altura?: string;
  peso?: string;
  deporte?: string;
  id_entrenador?: string;
  frecuencia_cardiaca_minima?: string;
  especialidad?: string;
  experiencia?: string;
};

export default function Register() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    tipo: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setFormData({ ...formData, tipo: role });
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      handleChange('fecha_nacimiento', isoDate);
    }
  };

  const handleSubmit = async () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name) newErrors.name = 'Nombre es requerido';
    if (!formData.email) newErrors.email = 'Email es requerido';
    if (!formData.password) newErrors.password = 'Contraseña es requerida';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }
    if (!formData.tipo) newErrors.tipo = 'Debes seleccionar un tipo de usuario';

    if (selectedRole === 'atleta') {
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
      if (!formData.altura) newErrors.altura = 'Altura es requerida';
      if (!formData.peso) newErrors.peso = 'Peso es requerido';
      if (!formData.deporte) newErrors.deporte = 'Deporte es requerido';
      if (!formData.frecuencia_cardiaca_minima) newErrors.frecuencia_cardiaca_minima = 'F.C. mínima es requerida';
    } else if (selectedRole === 'entrenador') {
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
      if (!formData.especialidad) newErrors.especialidad = 'Especialidad es requerida';
      if (!formData.experiencia) newErrors.experiencia = 'Experiencia es requerida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: any = {
      email: formData.email,
      contrasena: formData.password,
      nombre_completo: formData.name,
      fecha_nacimiento: formData.fecha_nacimiento,
    };

    if (selectedRole === 'entrenador') {
      payload.especialidad = formData.especialidad;
      payload.experiencia = formData.experiencia;
    } else if (selectedRole === 'atleta') {
      payload.altura = parseFloat(formData.altura || '0');
      payload.peso = parseFloat(formData.peso || '0');
      payload.deporte = formData.deporte;
      payload.id_entrenador = formData.id_entrenador ? parseInt(formData.id_entrenador) : undefined;
      payload.frecuencia_cardiaca_minima = parseInt(formData.frecuencia_cardiaca_minima || '0');
    }

    try {
      const data = await registrar(formData);
      Alert.alert('Registro exitoso', `Bienvenido/a ${data.nombre_completo}`);
      router.push('/login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo registrar');
    }
  };

  const renderFechaNacimiento = () => (
    <>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={{ color: formData.fecha_nacimiento ? 'black' : '#9ca3af' }}>
          {formData.fecha_nacimiento || 'Seleccionar fecha de nacimiento'}
        </Text>
      </TouchableOpacity>
      {errors.fecha_nacimiento && <Text style={styles.error}>{errors.fecha_nacimiento}</Text>}
      {showDatePicker && (
        <DateTimePicker
          value={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro de usuario</Text>

        <TextInput
          placeholder="Nombre"
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        <TextInput
          placeholder="Correo electrónico"
          keyboardType="email-address"
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
        />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <TextInput
          placeholder="Contraseña"
          secureTextEntry
          style={styles.input}
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
        />
        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

        <TextInput
          placeholder="Confirmar contraseña"
          secureTextEntry
          style={styles.input}
          value={formData.password_confirmation}
          onChangeText={(text) => handleChange('password_confirmation', text)}
        />
        {errors.password_confirmation && (
          <Text style={styles.error}>{errors.password_confirmation}</Text>
        )}

        <View style={styles.selectContainer}>
          <Text style={styles.label}>Tipo de usuario:</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleRoleChange('atleta')}
            >
              <View style={selectedRole === 'atleta' ? styles.radioSelected : styles.radio} />
              <Text>Atleta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleRoleChange('entrenador')}
            >
              <View style={selectedRole === 'entrenador' ? styles.radioSelected : styles.radio} />
              <Text>Entrenador</Text>
            </TouchableOpacity>
          </View>
          {errors.tipo && <Text style={styles.error}>{errors.tipo}</Text>}
        </View>

        {selectedRole === 'atleta' && (
          <>
            <Text style={styles.sectionTitle}>Información del Atleta</Text>
            {renderFechaNacimiento()}

            <TextInput
              placeholder="Altura (cm)"
              keyboardType="numeric"
              style={styles.input}
              value={formData.altura}
              onChangeText={(text) => handleChange('altura', text)}
            />
            {errors.altura && <Text style={styles.error}>{errors.altura}</Text>}

            <TextInput
              placeholder="Peso (kg)"
              keyboardType="numeric"
              style={styles.input}
              value={formData.peso}
              onChangeText={(text) => handleChange('peso', text)}
            />
            {errors.peso && <Text style={styles.error}>{errors.peso}</Text>}

            <TextInput
              placeholder="Deporte"
              style={styles.input}
              value={formData.deporte}
              onChangeText={(text) => handleChange('deporte', text)}
            />
            {errors.deporte && <Text style={styles.error}>{errors.deporte}</Text>}

            <TextInput
              placeholder="Frecuencia cardíaca mínima"
              keyboardType="numeric"
              style={styles.input}
              value={formData.frecuencia_cardiaca_minima}
              onChangeText={(text) => handleChange('frecuencia_cardiaca_minima', text)}
            />
            {errors.frecuencia_cardiaca_minima && <Text style={styles.error}>{errors.frecuencia_cardiaca_minima}</Text>}

            <TextInput
              placeholder="ID Entrenador (opcional)"
              style={styles.input}
              value={formData.id_entrenador}
              onChangeText={(text) => handleChange('id_entrenador', text)}
            />
          </>
        )}

        {selectedRole === 'entrenador' && (
          <>
            <Text style={styles.sectionTitle}>Información del Entrenador</Text>
            {renderFechaNacimiento()}

            <TextInput
              placeholder="Especialidad"
              style={styles.input}
              value={formData.especialidad}
              onChangeText={(text) => handleChange('especialidad', text)}
            />
            {errors.especialidad && <Text style={styles.error}>{errors.especialidad}</Text>}

            <TextInput
              placeholder="Experiencia (años)"
              keyboardType="numeric"
              style={styles.input}
              value={formData.experiencia}
              onChangeText={(text) => handleChange('experiencia', text)}
            />
            {errors.experiencia && <Text style={styles.error}>{errors.experiencia}</Text>}
          </>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        <Link href="/login" style={styles.link}>
          ¿Ya estás registrado? Inicia sesión
        </Link>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#f97316',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#f97316',
  },
  input: {
    borderWidth: 1,
    borderColor: '#fb923c',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  selectContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f97316',
  },
  button: {
    backgroundColor: '#f97316',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#f97316',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
});