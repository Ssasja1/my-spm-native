import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_URL = 'https://apifastpi-production.up.railway.app';

export default function EditarPerfilAtleta() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre_completo: '',
    fecha_nacimiento: '',
    altura: '',
    peso: '',
    deporte: '',
    frecuencia_cardiaca_minima: '',
    frecuencia_cardiaca_maxima: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const fieldLabels = {
    nombre_completo: 'NOMBRE COMPLETO',
    fecha_nacimiento: 'FECHA DE NACIMIENTO',
    altura: 'ALTURA (cm)',
    peso: 'PESO (kg)',
    deporte: 'DEPORTE',
    frecuencia_cardiaca_minima: 'FC MÍNIMA (bpm)',
    frecuencia_cardiaca_maxima: 'FC MÁXIMA (bpm)',
  };

  useEffect(() => {
    const loadData = async () => {
      const atleta_id = await AsyncStorage.getItem('atleta_id');
      const res = await fetch(`${API_URL}/atletas/basico/${atleta_id}`);
      const data = await res.json();
      setForm({
        nombre_completo: data.nombre_completo || '',
        fecha_nacimiento: data.fecha_nacimiento || '',
        altura: String(data.altura || ''),
        peso: String(data.peso || ''),
        deporte: data.deporte || '',
        frecuencia_cardiaca_minima: String(data.frecuencia_cardiaca_minima || ''),
        frecuencia_cardiaca_maxima: String(data.frecuencia_cardiaca_maxima || ''),
      });
    };

    loadData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      handleChange('fecha_nacimiento', formatted);
    }
  };

  const handleSubmit = async () => {
    const atleta_id = await AsyncStorage.getItem('atleta_id');
    if (!atleta_id) {
      Alert.alert('Error', 'ID del atleta no encontrado');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/atletas/editar/${atleta_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: form.nombre_completo,
          fecha_nacimiento: form.fecha_nacimiento || undefined,
          altura: form.altura ? parseFloat(form.altura) : undefined,
          peso: form.peso ? parseFloat(form.peso) : undefined,
          deporte: form.deporte,
          frecuencia_cardiaca_minima: form.frecuencia_cardiaca_minima
            ? parseInt(form.frecuencia_cardiaca_minima)
            : undefined,
          frecuencia_cardiaca_maxima: form.frecuencia_cardiaca_maxima
            ? parseInt(form.frecuencia_cardiaca_maxima)
            : undefined,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.json();
        console.error('Error 422 detalle:', errorBody);
        Alert.alert('Error', JSON.stringify(errorBody.detail));
        return;
      }

      Alert.alert('¡ÉXITO!', '¡Perfil actualizado! ¡A romperla en el gym!');
      router.replace('/(tabs)/DashboardAtleta');
    } catch (error) {
      console.error('Error en la actualización:', error);
      Alert.alert('Error', 'Ocurrió un error al actualizar el perfil.');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>EDITA TU PERFIL</Text>
          <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.formContainer}>
          {Object.keys(form).map((key) => (
            <View key={key} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {fieldLabels[key as keyof typeof fieldLabels]}
              </Text>

              {key === 'fecha_nacimiento' ? (
                <>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.input}
                  >
                    <Text style={{ color: form[key] ? '#fff' : '#747474ff' }}>
                      {form[key] || 'Selecciona tu fecha de nacimiento'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={form[key] ? new Date(form[key]) : new Date()}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()} // Evita seleccionar fechas futuras
                    />
                  )}
                </>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder={`Ingresa tu ${key.replace(/_/g, ' ').toLowerCase()}`}
                  placeholderTextColor="#747474ff"
                  keyboardType={['altura', 'peso', 'frecuencia_cardiaca_minima', 'frecuencia_cardiaca_maxima'].includes(key) ? 'numeric' : 'default'}
                  value={form[key as keyof typeof form]}
                  onChangeText={(value) => handleChange(key, value)}
                />
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>ACTUALIZAR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
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
});
