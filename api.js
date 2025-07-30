// api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

//const API_URL = 'http://localhost:8000'; // Reemplaza con tu IP real si usas un emulador o dispositivo físico
const API_URL = 'http://192.168.68.102:8000';

export async function registrar(formData) {
    const endpoint = `${API_URL}/registro/`;

    const payload = {
        email: formData.email,
        contrasena: formData.password,
        tipo: formData.tipo,
        nombre_completo: formData.name,
        fecha_nacimiento: formData.fecha_nacimiento,
    };

    if (formData.tipo === "atleta") {
        Object.assign(payload, {
            altura: parseFloat(formData.altura),
            peso: parseFloat(formData.peso),
            deporte: formData.deporte,
            frecuencia_cardiaca_minima: parseInt(formData.frecuencia_cardiaca_minima),
            id_entrenador: formData.id_entrenador
                ? parseInt(formData.id_entrenador)
                : null,
        });
    } else if (formData.tipo === "entrenador") {
        Object.assign(payload, {
            especialidad: formData.especialidad,
            experiencia: formData.experiencia,
        });
    }

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al registrar");
    }

    return await res.json();
}


export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  return await response.json();
}

export const getAtletaById = async () => {
  const id = await AsyncStorage.getItem('atleta_id');

  if (!id) {
    throw new Error('ID de atleta no encontrado');
  }

  const response = await fetch(`${API_URL}/atletas/${id}`);
  if (!response.ok) {
    const raw = await response.text();
    console.error('Respuesta no OK:', raw);
    throw new Error('No se pudo obtener la información del atleta');
  }

  const data = await response.json();
  return data;
};

export const getCoachById = async (id_usuario) => {
  const response = await fetch(`${API_URL}/coaches/${id_usuario}`);

  if (!response.ok) {
    const raw = await response.text();
    console.error('Respuesta no OK:', raw);
    throw new Error('No se pudo obtener la información del coach');
  }

  const data = await response.json();
  return data;
};

export const createWorkout = async (entrenamiento) => {
  const response = await fetch(`${API_URL}/coaches/entrenamientos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entrenamiento),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error al crear entrenamiento:', errorText);
    throw new Error('No se pudo crear el entrenamiento');
  }

  return await response.json();
};

export const getWorkoutsByCoach = async (id_entrenador) => {
  const response = await fetch(`${API_URL}/coaches/entrenamientos/coach/${id_entrenador}`);

  if (!response.ok) {
    const raw = await response.text();
    console.error('Respuesta no OK:', raw);
    throw new Error('No se pudo obtener los entrenamientos');
  }

  const data = await response.json();
  return data;
};

export const getWorkoutById = async (id_entrenamiento) => {
  const response = await fetch(`${API_URL}/coaches/entrenamientos/${id_entrenamiento}`);

  if (!response.ok) {
    const raw = await response.text();
    console.error('Error al obtener entrenamiento:', raw);
    throw new Error('No se pudo obtener el entrenamiento');
  }

  return await response.json();
};

export const updateWorkout = async (id_entrenamiento, updatedData) => {
  const response = await fetch(`${API_URL}/coaches/entrenamientos/${id_entrenamiento}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const raw = await response.text();
    console.error('Error actualizando:', raw);
    throw new Error('No se pudo actualizar el entrenamiento');
  }

  return await response.json();
};

