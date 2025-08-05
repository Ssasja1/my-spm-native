import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

interface Atleta {
  id_atleta: number;
  nombre_completo: string;
}

const BASE_URL = 'https://apifastpi-production.up.railway.app';

async function fetchAtletas(id_entrenador: number): Promise<Atleta[]> {
  const response = await fetch(`${BASE_URL}/coaches/${id_entrenador}/atletas`);
  if (!response.ok) throw new Error('Error al cargar atletas');
  const data = await response.json();
  return data;
}

export default function AsignarEntrenamiento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [idEntrenador, setIdEntrenador] = useState<number | null>(null);

  useEffect(() => {
    async function cargarAtletas() {
      try {
        const id_usuario = await AsyncStorage.getItem('user_id');
        if (!id_usuario) throw new Error('No se encontró usuario');

        const responseCoach = await fetch(`${BASE_URL}/coaches/${id_usuario}`);
        if (!responseCoach.ok) throw new Error('Error al obtener datos del coach');
        const coachData = await responseCoach.json();
        setIdEntrenador(coachData.id_entrenador);

        const atletasAsignados = await fetchAtletas(coachData.id_entrenador);
        setAtletas(atletasAsignados);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }
    cargarAtletas();
  }, []);

  const toggleSeleccion = (id_atleta: number) => {
    setSeleccionados((prev) =>
      prev.includes(id_atleta)
        ? prev.filter((id) => id !== id_atleta)
        : [...prev, id_atleta]
    );
  };

  const handleAsignar = async () => {
    if (seleccionados.length === 0) {
      Alert.alert('Selecciona al menos un atleta');
      return;
    }
    if (!id) {
      Alert.alert('Error', 'ID de entrenamiento inválido');
      return;
    }

    try {
      setLoading(true);
      const payload = seleccionados.map(id_atleta => ({
        id_entrenamiento: Number(id),
        id_atleta,
      }));

      await Promise.all(payload.map(async (asignacion) => {
        const res = await fetch(`${BASE_URL}/coaches/asignaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(asignacion),
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Error al asignar entrenamiento');
        }
      }));

      Alert.alert('Éxito', `Entrenamiento asignado a ${seleccionados.length} atleta(s)`);
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Cargando atletas...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>ASIGNAR ENTRENAMIENTO</Text>
        <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="people" size={24} color="#FF6B00" />
          <Text style={styles.sectionTitle}>SELECCIONA ATLETAS</Text>
        </View>

        {atletas.length === 0 ? (
          <Text style={styles.emptyText}>No tienes atletas asignados</Text>
        ) : (
          atletas.map((atleta) => (
            <TouchableOpacity
              key={atleta.id_atleta}
              style={[
                styles.atletaItem,
                seleccionados.includes(atleta.id_atleta) && styles.selected,
              ]}
              onPress={() => toggleSeleccion(atleta.id_atleta)}
            >
              <Text style={styles.atletaNombre}>{atleta.nombre_completo}</Text>
              {seleccionados.includes(atleta.id_atleta) && (
                <MaterialIcons name="check" size={20} color="#FF6B00" />
              )}
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={styles.asignarButton} 
        onPress={handleAsignar}
        disabled={seleccionados.length === 0}
      >
        <Text style={styles.asignarText}>
          ASIGNAR A {seleccionados.length} ATLETA{seleccionados.length !== 1 ? 'S' : ''}
        </Text>
      </TouchableOpacity>
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
  card: {
    backgroundColor: '#252525',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
    marginLeft: 8,
    letterSpacing: 1.5,
    fontFamily: 'monospace',
  },
  atletaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selected: {
    backgroundColor: '#252525',
    borderColor: '#FF6B00',
  },
  atletaNombre: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  emptyText: {
    color: '#a3a3a3',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginTop: 10,
  },
  asignarButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    padding: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: '#FF6B00',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
    opacity: 1,
  },
  asignarText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#f1f1f1',
    fontFamily: 'monospace',
  },
});