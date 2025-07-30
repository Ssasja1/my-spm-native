import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { createWorkout, getCoachById } from '../../api'; // Asegúrate que estén bien importadas


export default function CrearEntrenamiento() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [nivel, setNivel] = useState('');
  const [loading, setLoading] = useState(false);

  const niveles = ['principiante', 'intermedio', 'avanzado'];

const crearEntrenamiento = async () => {
  if (!titulo || !duracion || !nivel) {
    Alert.alert('Error', 'Todos los campos obligatorios deben ser completados.');
    return;
  }

  if (!niveles.includes(nivel)) {
    Alert.alert('Error', 'El nivel de dificultad no es válido.');
    return;
  }

  setLoading(true);

try {
  const id_usuario = await AsyncStorage.getItem('user_id');
  if (!id_usuario) throw new Error('ID del usuario no encontrado.');

  // ✅ Obtener el perfil del coach y su id_entrenador
  const coach = await getCoachById(id_usuario);
  const id_entrenador = coach.id_entrenador;

  // ✅ Crear el entrenamiento con el ID correcto
  const data = await createWorkout({
    id_entrenador,
    titulo,
    descripcion,
    duracion_estimada: parseInt(duracion),
    nivel_dificultad: nivel,
  });

  Alert.alert('Éxito', 'Entrenamiento creado correctamente. ID: ' + data.id_entrenamiento);
  setTitulo('');
  setDescripcion('');
  setDuracion('');
  setNivel('');
} catch (error) {
  console.error('Error al crear entrenamiento:', error);

  if (error instanceof Error) {
    Alert.alert('Error', error.message);
  } else {
    Alert.alert('Error', 'Ocurrió un error al crear el entrenamiento.');
  }
} finally {
  setLoading(false);
}
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Crear Nuevo Entrenamiento</Text>

      <TextInput
        style={styles.input}
        placeholder="Título del Entrenamiento"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Descripción (opcional)"
        multiline
        numberOfLines={4}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        style={styles.input}
        placeholder="Duración Estimada (min)"
        keyboardType="numeric"
        value={duracion}
        onChangeText={setDuracion}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={nivel}
          onValueChange={(itemValue) => setNivel(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona nivel de dificultad..." value="" />
          <Picker.Item label="Principiante" value="principiante" />
          <Picker.Item label="Intermedio" value="intermedio" />
          <Picker.Item label="Avanzado" value="avanzado" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={crearEntrenamiento}>
          <Text style={styles.buttonText}>Crear Entrenamiento</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  textarea: {
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
    fontSize: 16,
  },
});
