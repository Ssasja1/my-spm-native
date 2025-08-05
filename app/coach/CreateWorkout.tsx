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
import { createWorkout, getCoachById } from '../../api';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

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

      const coach = await getCoachById(id_usuario);
      const id_entrenador = coach.id_entrenador;

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

      router.replace('/coach/MyWorkouts');
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
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>CREAR NUEVO ENTRENAMIENTO</Text>
        <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="title" size={24} color="#FF6B00" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Título del Entrenamiento"
          placeholderTextColor="#666"
          value={titulo}
          onChangeText={setTitulo}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="description" size={24} color="#FF6B00" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Descripción (opcional)"
          placeholderTextColor="#666"
          multiline
          numberOfLines={4}
          value={descripcion}
          onChangeText={setDescripcion}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="timer" size={24} color="#FF6B00" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Duración Estimada (min)"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={duracion}
          onChangeText={setDuracion}
        />
      </View>

      <View style={styles.inputContainer}>
        <MaterialIcons name="fitness-center" size={24} color="#FF6B00" style={styles.inputIcon} />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={nivel}
            onValueChange={(itemValue) => setNivel(itemValue)}
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
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B00" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={crearEntrenamiento}>
          <Text style={styles.buttonText}>CREAR ENTRENAMIENTO</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingTop: 50,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    padding: 16,
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
    textAlignVertical: 'top',
    height: 120,
  },
  pickerContainer: {
    flex: 1,
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
  button: {
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
  buttonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  loader: {
    marginVertical: 24,
  },
});