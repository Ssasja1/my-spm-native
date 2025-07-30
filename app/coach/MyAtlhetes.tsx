import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getCoachDashboard } from '../../api'; // Debes crear esta función en api.ts

//este aun queda, falta darle la funcionalidad de obtener los atletas asignados al coach y mostrarlos en la pantalla

interface AtletaAsignado {
  nombre_completo: string;
  deporte: string;
  fecha_nacimiento: string;
  frecuencia_cardiaca_maxima: number;
  frecuencia_cardiaca_minima: number;
}

interface DashboardCoachData {
  nombre_completo: string;
  especialidad?: string;
  experiencia?: string;
  atletas_asignados: AtletaAsignado[];
}

export default function DashboardCoach() {
  const router = useRouter();
  const [coach, setCoach] = useState<DashboardCoachData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) {
          router.replace('/login');
          return;
        }

        const data = await getCoachDashboard(id);
        setCoach(data);
      } catch (error) {
        console.error('Error al cargar el panel del coach:', error);
        Alert.alert('Error', 'No se pudo cargar el panel del coach');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calcularEdad = (fecha: string) => {
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" style={{ flex: 1 }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Bienvenido al Panel del Coach</Text>
      <Text style={styles.description}>
        En este apartado puedes consultar tu información personal y ver la lista de atletas que tienes asignados.
      </Text>

      {coach && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          <Text>Nombre: {coach.nombre_completo}</Text>
          <Text>Especialidad: {coach.especialidad || 'No especificada'}</Text>
          <Text>Experiencia: {coach.experiencia || 'No disponible'}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Atletas Asignados</Text>
        {coach?.atletas_asignados?.length ? (
          coach.atletas_asignados.map((a, i) => (
            <View key={i} style={styles.athleteCard}>
              <Text style={styles.athleteName}>{a.nombre_completo}</Text>
              <Text>Deporte: {a.deporte}</Text>
              <Text>Edad: {calcularEdad(a.fecha_nacimiento)} años</Text>
              <Text>F.C. Máx: {a.frecuencia_cardiaca_maxima} bpm</Text>
              <Text>F.C. Mín: {a.frecuencia_cardiaca_minima} bpm</Text>
            </View>
          ))
        ) : (
          <Text>No hay atletas asignados.</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.clear();
          router.replace('/login');
        }}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  athleteCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  athleteName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
