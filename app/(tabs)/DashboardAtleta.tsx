import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getAtletaById } from '../../api';
import { TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Entrenamiento {
  id_entrenamiento: number;
  titulo: string;
  descripcion?: string;
  duracion_estimada?: number;
  nivel_dificultad?: 'principiante' | 'intermedio' | 'avanzado';
}

interface Asignacion {
  id_asignacion: number;
  estado: string;
  entrenamiento: Entrenamiento;
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
  asignaciones?: Asignacion[];
}

export default function AthleteDashboard() {
  const router = useRouter();
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [zonasFrecuencia, setZonasFrecuencia] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtleta = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) {
          router.replace('/login');
          return;
        }

        const data = await getAtletaById();
        console.log('✅ Datos completos del atleta:', JSON.stringify(data, null, 2));
        setAtleta(data);

        if (data.frecuencia_cardiaca_maxima && data.frecuencia_cardiaca_minima) {
          const zonas = calcularZonasFrecuencia(data.frecuencia_cardiaca_maxima, data.frecuencia_cardiaca_minima);
          setZonasFrecuencia(zonas);
        }
      } catch (err) {
        console.error('❌ Error al obtener datos del atleta:', err);
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

  if (loading) {
    return <ActivityIndicator size="large" color="#f97316" style={{ flex: 1 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Panel del Atleta</Text>

      {!atleta ? (
        <Text style={styles.error}>No se encontraron datos del atleta</Text>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Información Personal</Text>
            <Text>Nombre: {atleta.nombre_completo}</Text>
            <Text>Deporte: {atleta.deporte}</Text>
            <Text>Altura: {atleta.altura ?? 'N/A'} cm</Text>
            <Text>Peso: {atleta.peso ?? 'N/A'} kg</Text>
            <Text>Entrenador: {atleta.nombre_entrenador ?? 'No asignado'}</Text>
          </View>

          {zonasFrecuencia && (
            <View style={styles.card}>
              <Text style={styles.subtitle}>Zonas de Frecuencia Cardiaca</Text>
              {Object.entries(zonasFrecuencia).map(([zona, valor], i, arr) => (
                <Text key={zona}>
                  {zona}: {valor}{i < arr.length - 1 ? ` - ${arr[i + 1][1]}` : ''} bpm
                </Text>
              ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.subtitle}>Mis Entrenamientos</Text>
            {atleta.asignaciones && atleta.asignaciones.length > 0 ? (
              atleta.asignaciones.map((asig, i) => (
                <View key={asig.id_asignacion} style={styles.trainingCard}>
                  <Text style={styles.trainingTitle}>{asig.entrenamiento.titulo}</Text>
                  <Text>{asig.entrenamiento.descripcion}</Text>
                  <Text>Duración: {asig.entrenamiento.duracion_estimada ?? '?'} min</Text>
                  <Text>Dificultad: {asig.entrenamiento.nivel_dificultad ?? 'No especificada'}</Text>
                  <Text>Estado: {asig.estado}</Text>
                </View>
              ))
            ) : (
              <Text>No hay entrenamientos asignados.</Text>
            )}
          </View>
        </>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          try {
            await AsyncStorage.clear();
            router.replace('/login');
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
          }
        }}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#3b82f6',
          padding: 12,
          borderRadius: 8,
          marginTop: 10,
        }}
        onPress={() => router.push('/atleta/EditarPerfilAtleta')}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          Editar Perfil
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  trainingCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
  },
  trainingTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#111827',
  },
  error: {
    padding: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#b91c1c',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
