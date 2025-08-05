import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, StatusBar, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getAtletaById } from '../../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface Entrenamiento {
  id: number;
  titulo: string;
  descripcion?: string;
  duracion_estimada?: number;
  nivel_dificultad?: 'principiante' | 'intermedio' | 'avanzado';
  estado?: string;
}

interface Atleta {
  id_atleta: number;
  nombre_completo: string;
  fecha_nacimiento: string;
  altura?: number;
  peso?: number;
  deporte: string;
  frecuencia_cardiaca_maxima?: number;
  frecuencia_cardiaca_minima?: number;
  nombre_entrenador?: string;
  entrenamientos?: Entrenamiento[];
}

export default function AthleteDashboard() {
  const router = useRouter();
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [zonasFrecuencia, setZonasFrecuencia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAtleta = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        
        if (!id) {
          setError('No se encontró sesión activa');
          router.replace('/login');
          return;
        }

        const data = await getAtletaById();
        
        if (!data) {
          setError('No se pudieron cargar los datos del atleta');
          return;
        }

        setAtleta(data);

        if (data.frecuencia_cardiaca_maxima && data.frecuencia_cardiaca_minima) {
          const zonas = calcularZonasFrecuencia(
            data.frecuencia_cardiaca_maxima,
            data.frecuencia_cardiaca_minima
          );
          setZonasFrecuencia(zonas);
        } else {
          setError('Datos de frecuencia cardíaca incompletos');
        }
      } catch (err) {
        console.error('Error al obtener datos del atleta:', err);
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchAtleta();
  }, []);

  const calcularZonasFrecuencia = (max: number, reposo: number) => {
    const rango = max - reposo;
    return {
      'Zona 1 (Recuperación)': Math.round(reposo + 0.5 * rango),
      'Zona 2 (Aeróbico Ligero)': Math.round(reposo + 0.6 * rango),
      'Zona 3 (Aeróbico)': Math.round(reposo + 0.7 * rango),
      'Zona 4 (Umbral Anaeróbico)': Math.round(reposo + 0.8 * rango),
      'Zona 5 (Esfuerzo Máximo)': Math.round(reposo + 0.9 * rango),
      'Frecuencia Máxima': max,
    };
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar la sesión');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>PANEL DE ATLETA</Text>
          <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
          <View style={styles.divider} />
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !atleta ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>No se encontraron datos del atleta</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.subtitle2}>Información Personal</Text>
              <Text style={styles.BText}>Nombre: {atleta.nombre_completo}</Text>
              <Text style={styles.BText}>Deporte: {atleta.deporte}</Text>
              <Text style={styles.BText}>Altura: {atleta.altura ?? 'N/A'} cm</Text>
              <Text style={styles.BText}>Peso: {atleta.peso ?? 'N/A'} kg</Text>
              <Text style={styles.BText}>Entrenador: {atleta.nombre_entrenador ?? 'No asignado'}</Text>
            </View>

            {zonasFrecuencia && (
              <View style={styles.card}>
                <Text style={styles.subtitle2}>Zonas de Frecuencia Cardiaca</Text>
                 {Object.entries(zonasFrecuencia).map(([zona, valor], i, arr) => (
                <Text key={zona} style={styles.BText}>
                  {zona}: {valor as number}
                  {i < arr.length - 1 ? ` - ${(arr[i + 1][1] as number)}` : ''} bpm
              </Text>
          ))}
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.subtitle2}>Mis Entrenamientos</Text>
              {atleta.entrenamientos && atleta.entrenamientos.length > 0 ? (
                atleta.entrenamientos.map((ent: any, i: number) => (
                  <View key={i} style={styles.trainingCard}>
                    <Text style={styles.trainingTitle}>{ent.titulo}</Text>
                    <Text style={styles.BText}>{ent.descripcion}</Text>
                    <Text style={styles.BText}>Duración: {ent.duracion_estimada ?? '?'} min</Text>
                    <Text style={styles.BText}>Dificultad: {ent.nivel_dificultad ?? 'No especificada'}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.BText}>No hay entrenamientos asignados.</Text>
              )}
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/atleta/EditarPerfilAtleta')}
        >
          <Text style={styles.editText}>Editar Perfil</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#b9b9b9ff',
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  subtitle2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#b9b9b9ff',
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#252525ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  BText: {
    color: '#c3c3c3ff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  trainingCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1a1a1aff',
    borderRadius: 10,
  },
  trainingTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#edededff',
  },
  errorCard: {
    backgroundColor: '#2a0e0e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  logoutButton: {
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
  logoutText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  editButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF6B00',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  editText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#FF6B00',
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
  loadingText: {
    marginTop: 10,
    color: '#FF6B00',
    fontFamily: 'monospace',
  },
});