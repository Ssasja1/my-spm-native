import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
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
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Cargando entrenamiento...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>EDITAR ENTRENAMIENTO</Text>
        <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
        <View style={styles.divider} />
      </View>
      
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        value={form.titulo}
        onChangeText={(text) => handleChange('titulo', text)}
        placeholder="Título del entrenamiento"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={form.descripcion}
        onChangeText={(text) => handleChange('descripcion', text)}
        placeholder="Descripción"
        placeholderTextColor="#666"
        multiline
      />

      <Text style={styles.label}>Duración estimada (minutos)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.duracion_estimada}
        onChangeText={(text) => handleChange('duracion_estimada', text)}
        placeholder="Duración en minutos"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Nivel de dificultad</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.nivel_dificultad}
          onValueChange={(value) => handleChange('nivel_dificultad', value)}
          style={styles.picker}
          dropdownIconColor="#FF6B00"
        >
          <Picker.Item 
            label="Selecciona nivel de dificultad..." 
            value="" 
            style={styles.pickerItem}
          />
          <Picker.Item 
            label="Principiante" 
            value="principiante" 
            style={styles.pickerItem}
          />
          <Picker.Item 
            label="Intermedio" 
            value="intermedio" 
            style={styles.pickerItem}
          />
          <Picker.Item 
            label="Avanzado" 
            value="avanzado" 
            style={styles.pickerItem}
          />
        </Picker>
      </View>

      <TouchableOpacity 
        style={styles.guardarButton} 
        onPress={handleSubmit}
      >
        <Text style={styles.guardarText}>GUARDAR CAMBIOS</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    color: '#f1f1f1',
    marginTop: 10,
    fontFamily: 'monospace',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF6B00',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#FF6B00',
    marginVertical: 12,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    color: '#CCCCCC',
    fontFamily: 'monospace',
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopColor: '#333333',
    borderLeftColor: '#333333',
    borderRightColor: '#333333',
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B00',
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 6,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#1A1A1A',
    color: '#ffffff',
  },
  pickerItem: {
    color: '#ffffff',
    backgroundColor: '#1A1A1A',
    fontFamily: 'monospace',
  },
  guardarButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    padding: 16,
    margin: 16,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#FF6B00',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  guardarText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
});