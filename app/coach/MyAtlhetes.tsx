import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getCoachDashboard } from '../../api';
import { MaterialIcons } from '@expo/vector-icons';

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
        console.log('Datos del coach:', data);
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
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Cargando datos del coach...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>PANEL DEL COACH</Text>
        <Text style={styles.subtitle}>CADA DATO TE ACERCA A LA GRANDEZA</Text>
        <View style={styles.divider} />
      </View>

      {coach && (
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person" size={24} color="#FF6B00" />
            <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{coach.nombre_completo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Especialidad:</Text>
            <Text style={styles.infoValue}>{coach.especialidad || 'No especificada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Experiencia:</Text>
            <Text style={styles.infoValue}>{coach.experiencia || 'No disponible'}</Text>
          </View>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="people" size={24} color="#FF6B00" />
          <Text style={styles.sectionTitle}>ATLETAS ASIGNADOS</Text>
        </View>
        
        {coach?.atletas_asignados?.length ? (
          coach.atletas_asignados.map((a, i) => (
            <View key={i} style={styles.athleteCard}>
              <Text style={styles.athleteName}>{a.nombre_completo}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Deporte:</Text>
                <Text style={styles.infoValue}>{a.deporte}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Edad:</Text>
                <Text style={styles.infoValue}>{calcularEdad(a.fecha_nacimiento)} años</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>F.C. Máx:</Text>
                <Text style={styles.infoValue}>{a.frecuencia_cardiaca_maxima} bpm</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>F.C. Mín:</Text>
                <Text style={styles.infoValue}>{a.frecuencia_cardiaca_minima} bpm</Text>
              </View>
              {i < coach.atletas_asignados.length - 1 && <View style={styles.separator} />}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay atletas asignados</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await AsyncStorage.clear();
          router.replace('/login');
        }}
      >
        <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#a3a3a3',
    fontFamily: 'monospace',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  athleteCard: {
    paddingVertical: 12,
  },
  athleteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  separator: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 12,
  },
  emptyText: {
    color: '#a3a3a3',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  logoutButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    margin: 16,
    marginTop: 10,
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