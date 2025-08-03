import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_URL = 'http://192.168.101.9:8000'; // ✅ Usa tu IP local aquí
//const API_URL = 'http://localhost:8000';  aca usas el que estes usando en tu entorno de desarrollo

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

    Alert.alert('Éxito', 'Perfil actualizado correctamente');
    router.replace('/(tabs)/DashboardAtleta');
  } catch (error) {
    console.error('Error en la actualización:', error);
    Alert.alert('Error', 'Ocurrió un error al actualizar el perfil.');
  }
};


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      {Object.keys(form).map((key) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={key.replace(/_/g, ' ')}
          value={form[key as keyof typeof form]}
          onChangeText={(value) => handleChange(key, value)}
        />
      ))}

      <Button title="Guardar Cambios" color="#f97316" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
});
