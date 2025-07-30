import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getWorkoutById, updateWorkout } from '../../api';

interface FormState {
  titulo: string;
  descripcion: string;
  duracion_estimada: string;
  nivel_dificultad: string;
  id_entrenador: number | null;
}

export default function EditarEntrenamiento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>({
    titulo: '',
    descripcion: '',
    duracion_estimada: '',
    nivel_dificultad: '',
    id_entrenador: null,
  });

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const data = await getWorkoutById(Number(id));
        setForm({
          titulo: data.titulo,
          descripcion: data.descripcion,
          duracion_estimada: String(data.duracion_estimada),
          nivel_dificultad: data.nivel_dificultad,
          id_entrenador: data.id_entrenador,
        });
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          Alert.alert('Error', err.message);
        } else {
          Alert.alert('Error', 'Ocurrió un error desconocido');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWorkout();
  }, [id]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const updated = {
        id_entrenador: form.id_entrenador,
        titulo: form.titulo,
        descripcion: form.descripcion,
        duracion_estimada: parseInt(form.duracion_estimada),
        nivel_dificultad: form.nivel_dificultad,
      };
      await updateWorkout(Number(id), updated);
      Alert.alert('Éxito', 'Entrenamiento actualizado correctamente');
      router.back();
    } catch (err) {
      console.error('Error actualizando:', err);
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', 'Ocurrió un error desconocido');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Cargando entrenamiento...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={form.titulo}
        onChangeText={(text) => handleChange('titulo', text)}
        placeholder="Título del entrenamiento"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={form.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        placeholder="Descripción"
        multiline
      />

      <Text style={styles.label}>Duración estimada (minutos)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.duracion_estimada}
        onChangeText={(text) => handleChange('duracion_estimada', text)}
        placeholder="Duración en minutos"
      />

      <Text style={styles.label}>Nivel de dificultad</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.nivel_dificultad}
          onValueChange={(value) => handleChange('nivel_dificultad', value)}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona nivel de dificultad..." value="" />
          <Picker.Item label="Principiante" value="principiante" />
          <Picker.Item label="Intermedio" value="intermedio" />
          <Picker.Item label="Avanzado" value="avanzado" />
        </Picker>
      </View>

      <Button title="Guardar cambios" color="#4CAF50" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
});
