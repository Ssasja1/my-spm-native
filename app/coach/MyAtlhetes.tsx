import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Atleta {
  id_atleta: number;
  nombre_completo: string;
  deporte: string;
  edad: number;
  frecuencia_cardiaca_maxima?: number;
  frecuencia_cardiaca_minima?: number;
}

export default function CoachDashboard() {
  const router = useRouter();
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAtletas = async () => {
      try {
        // Aquí deberías implementar la llamada a tu API para obtener los atletas del entrenador
        // Esto es un mock de datos basado en tu imagen
        const mockAtletas: Atleta[] = [
          {
            id_atleta: 1,
            nombre_completo: 'Aun no queda esto ',
            deporte: 'Atletismo',
            edad: 24,
            frecuencia_cardiaca_maxima: 196,
            frecuencia_cardiaca_minima: 78
          },
          {
            id_atleta: 2,
            nombre_completo: 'Aun no queda esto',
            deporte: 'Atletismo',
            edad: 21,
            frecuencia_cardiaca_maxima: 199,
            frecuencia_cardiaca_minima: 76
          }
        ];
        
        setAtletas(mockAtletas);
      } catch (err) {
        console.error('Error al obtener datos de los atletas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAtletas();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#f97316" style={{ flex: 1 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mis Atletas</Text>

      {atletas.length === 0 ? (
        <Text style={styles.error}>No tienes atletas asignados</Text>
      ) : (
        <>
          {atletas.map((atleta) => (
            <TouchableOpacity 
              key={atleta.id_atleta}
              style={styles.athleteCard}
            //   onPress={() => router.push(`/coach/atleta/${atleta.id_atleta}`)}
            >
              <Text style={styles.athleteName}>{atleta.nombre_completo}</Text>
              <View style={styles.athleteDetails}>
                <Text>Deporte: {atleta.deporte}</Text>
                <Text>Edad: {atleta.edad} años</Text>
                <Text>FC: {atleta.frecuencia_cardiaca_maxima}/{atleta.frecuencia_cardiaca_minima}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      <TouchableOpacity
        style={styles.addButton}
        // onPress={() => router.push('/coach/agregar-atleta')}
      >
        <Text style={styles.addButtonText}>+ Agregar Atleta</Text>
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
  athleteCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  athleteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  athleteDetails: {
    marginTop: 8,
  },
  error: {
    padding: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#b91c1c',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});