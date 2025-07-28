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
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel del Entrenador</Text>
        <Text style={styles.subtitle}>Gestión de tu perfil profesional</Text>
      </View>

      <View style={styles.content}>
      <Text style={[styles.description, { marginBottom: 50 }]}>
          Aquí encontrarás toda tu información personal como entrenador. 
          Este panel está diseñado para ayudarte a gestionar tus datos, 
          mantener un control de tu especialidad, tu experiencia profesional 
          y más adelante podrás acceder a los atletas que tienes asignados, 
          entrenamientos creados y estadísticas relevantes para tu desempeño.
        </Text>

        <Text style={styles.title}>Informacion Personal</Text>

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
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
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
    backgroundColor: '#f8fafc',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 24,
    textAlign: 'justify',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  infoSection: {
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
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
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});