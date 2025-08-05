import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { registrar } from '../api';
import DateTimePicker from '@react-native-community/datetimepicker';

type FormData = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  tipo: string;
  // Atleta
  fecha_nacimiento?: string;
  altura?: string;
  peso?: string;
  deporte?: string;
  id_entrenador?: string;
  frecuencia_cardiaca_minima?: string;
  // Entrenador
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
  const [date, setDate] = useState(new Date());
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

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('fecha_nacimiento', formattedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
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

  const fieldLabels = {
    name: 'NOMBRE COMPLETO',
    email: 'CORREO ELECTRÓNICO',
    password: 'CONTRASEÑA',
    password_confirmation: 'CONFIRMAR CONTRASEÑA',
    fecha_nacimiento: 'FECHA DE NACIMIENTO',
    altura: 'ALTURA (cm)',
    peso: 'PESO (kg)',
    deporte: 'DEPORTE',
    frecuencia_cardiaca_minima: 'FRECUENCIA CARDÍACA MÍNIMA (bpm)',
    id_entrenador: 'ID ENTRENADOR (OPCIONAL)',
    especialidad: 'ESPECIALIDAD',
    experiencia: 'EXPERIENCIA (años)'
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>FORJA TU CUENTA</Text>
        <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.formContainer}>
        {/* Campos comunes */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{fieldLabels.name}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nombre completo"
            placeholderTextColor="#747474ff"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{fieldLabels.email}</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="#747474ff"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{fieldLabels.password}</Text>
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{fieldLabels.password_confirmation}</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirma tu contraseña"
            placeholderTextColor="#747474ff"
            secureTextEntry
            value={formData.password_confirmation}
            onChangeText={(text) => handleChange('password_confirmation', text)}
          />
          {errors.password_confirmation && (
            <Text style={styles.error}>{errors.password_confirmation}</Text>
          )}
        </View>

        {/* Selección de rol */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>TIPO DE USUARIO</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleRoleChange('atleta')}
            >
              <View style={selectedRole === 'atleta' ? styles.radioSelected : styles.radio} />
              <Text style={styles.radioText}>ATLETA</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioButton}
              onPress={() => handleRoleChange('entrenador')}
            >
              <View style={selectedRole === 'entrenador' ? styles.radioSelected : styles.radio} />
              <Text style={styles.radioText}>ENTRENADOR</Text>
            </TouchableOpacity>
          </View>
          {errors.tipo && <Text style={styles.error}>{errors.tipo}</Text>}
        </View>

        {/* Campos específicos de atleta */}
        {selectedRole === 'atleta' && (
          <>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL ATLETA</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.fecha_nacimiento}</Text>
              <TouchableOpacity onPress={showDatepicker}>
                <TextInput
                  style={styles.input}
                  placeholder="Selecciona tu fecha de nacimiento"
                  placeholderTextColor="#747474ff"
                  value={formData.fecha_nacimiento}
                  editable={false}
                  onPressIn={showDatepicker}
                />
              </TouchableOpacity>
              {errors.fecha_nacimiento && <Text style={styles.error}>{errors.fecha_nacimiento}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.altura}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 175"
                placeholderTextColor="#747474ff"
                keyboardType="numeric"
                value={formData.altura}
                onChangeText={(text) => handleChange('altura', text)}
              />
              {errors.altura && <Text style={styles.error}>{errors.altura}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.peso}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 70.5"
                placeholderTextColor="#747474ff"
                keyboardType="numeric"
                value={formData.peso}
                onChangeText={(text) => handleChange('peso', text)}
              />
              {errors.peso && <Text style={styles.error}>{errors.peso}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.deporte}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Fútbol, Natación..."
                placeholderTextColor="#747474ff"
                value={formData.deporte}
                onChangeText={(text) => handleChange('deporte', text)}
              />
              {errors.deporte && <Text style={styles.error}>{errors.deporte}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.frecuencia_cardiaca_minima}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 60"
                placeholderTextColor="#747474ff"
                keyboardType="numeric"
                value={formData.frecuencia_cardiaca_minima}
                onChangeText={(text) => handleChange('frecuencia_cardiaca_minima', text)}
              />
              {errors.frecuencia_cardiaca_minima && <Text style={styles.error}>{errors.frecuencia_cardiaca_minima}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.id_entrenador}</Text>
              <TextInput
                style={styles.input}
                placeholder="Opcional"
                placeholderTextColor="#747474ff"
                keyboardType="numeric"
                value={formData.id_entrenador}
                onChangeText={(text) => handleChange('id_entrenador', text)}
              />
            </View>
          </>
        )}

        {/* Campos específicos de entrenador */}
        {selectedRole === 'entrenador' && (
          <>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL ENTRENADOR</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.fecha_nacimiento}</Text>
              <TouchableOpacity onPress={showDatepicker}>
                <TextInput
                  style={styles.input}
                  placeholder="Selecciona tu fecha de nacimiento"
                  placeholderTextColor="#747474ff"
                  value={formData.fecha_nacimiento}
                  editable={false}
                  onPressIn={showDatepicker}
                />
              </TouchableOpacity>
              {errors.fecha_nacimiento && <Text style={styles.error}>{errors.fecha_nacimiento}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.especialidad}</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Fuerza, Resistencia..."
                placeholderTextColor="#747474ff"
                value={formData.especialidad}
                onChangeText={(text) => handleChange('especialidad', text)}
              />
              {errors.especialidad && <Text style={styles.error}>{errors.especialidad}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{fieldLabels.experiencia}</Text>
              <TextInput
                style={styles.input}
                placeholder="Años de experiencia"
                placeholderTextColor="#747474ff"
                keyboardType="numeric"
                value={formData.experiencia}
                onChangeText={(text) => handleChange('experiencia', text)}
              />
              {errors.experiencia && <Text style={styles.error}>{errors.experiencia}</Text>}
            </View>
          </>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
            maximumDate={new Date()}
            textColor="#FF6B00"
            accentColor="#FF6B00"
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>REGISTRARSE</Text>
        </TouchableOpacity>

        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>¿YA TIENES CUENTA? INICIA SESIÓN</Text>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
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
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF6B00',
    marginRight: 8,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B00',
    marginRight: 8,
  },
  radioText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FF6B00',
    marginVertical: 15,
    letterSpacing: 2,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 25,
    borderWidth: 2,
    borderColor: '#FF6B00',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textDecorationLine: 'underline',
    fontFamily: 'monospace',
  },
  error: {
    color: '#FF3333',
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'monospace',
  },
});