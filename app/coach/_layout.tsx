// app/(coach)/_layout.tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function CoachTabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="DashboardCoach"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Alumnos"
        options={{
          title: 'Alumnos',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
        }}
      />
<Tabs.Screen
  name="MyAthletes"
  options={{
    title: 'Mis Atletas',
    tabBarIcon: ({ color }) => <TabBarIcon name="group" color={color} />,
  }}
/>
<Tabs.Screen
  name="MyWorkouts"
  options={{
    title: 'Mis Entrenamientos',
    tabBarIcon: ({ color }) => <TabBarIcon name="list-alt" color={color} />,
  }}
/>
<Tabs.Screen
  name="CreateWorkout"
  options={{
    title: 'Crear Entrenamiento',
    tabBarIcon: ({ color }) => <TabBarIcon name="plus-square" color={color} />,
  }}
/>
    </Tabs>
  );
}
