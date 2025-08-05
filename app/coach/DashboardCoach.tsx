// ✅ app/(coach)/DashboardCoach.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCoachById } from '../../api';

interface Coach {
  id_entrenador: number;
  nombre_completo: string;
  fecha_nacimiento: string;
  especialidad?: string;
  experiencia?: string;
}

export default function DashboardCoach() {
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        if (!id) {
          router.replace('/login');
          return;
        }
        const data = await getCoachById(id);
        setCoach(data);
      } catch (err) {
        console.error('Error al obtener datos del coach:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoach();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>PANEL DEL ENTRENADOR</Text>
        <Text style={styles.subtitle}>Gestión de tu perfil profesional</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.description, { marginBottom: 50 }]}>
          Aquí encontrarás toda tu información personal como entrenador. 
          Este panel está diseñado para ayudarte a gestionar tus datos, 
          mantener un control de tu especialidad, tu experiencia profesional 
          y más adelante podrás acceder a los atletas que tienes asignados, 
          entrenamientos creados y estadísticas relevantes para tu desempeño.
        </Text>

        <Text style={styles.title}>Información Personal</Text>

        {coach ? (
          <View style={styles.card}>
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Nombre completo</Text>
              <Text style={styles.infoText}>{coach.nombre_completo}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
              <Text style={styles.infoText}>{coach.fecha_nacimiento}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Especialidad</Text>
              <Text style={styles.infoText}>{coach.especialidad || 'No especificada'}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Experiencia</Text>
              <Text style={styles.infoText}>{coach.experiencia || 'No especificada'}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No se encontraron datos del entrenador</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace('/login');
          }}
        >
          <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
  },
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f1f1f1ff',
    textAlign: 'center',
    marginBottom: 4,
  },
  mainTitle: { 
    fontSize: 24,
    fontWeight: '900',
    color: '#FF6B00', 
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
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#b9b9b9ff',
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#a3a3a3ff',
    marginBottom: 24,
    textAlign: 'justify',
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
  infoSection: {
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a3a3a3ff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#f1f1f1ff',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
    fontSize: 15,
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
  logoutButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
});