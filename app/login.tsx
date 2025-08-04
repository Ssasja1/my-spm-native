import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export default function DashboardCoach() {
  const coach = {
    id_entrenador: 1,
    nombre_completo: 'Maritza Mtz',
    fecha_nacimiento: '1995-08-04',
    especialidad: 'Entrenamiento funcional',
    experiencia: '5 años en preparación física y resistencia',
  };

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
            <Text style={styles.infoText}>{coach.especialidad}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Experiencia</Text>
            <Text style={styles.infoText}>{coach.experiencia}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => alert('Cerrar sesión (modo demo)')}
        >
          <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
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
  divider: { //rayita naranja de arriba
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
  error: {
    padding: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#b91c1c',
  },
});