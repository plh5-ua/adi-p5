import { getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();
const usersCollection = collection(db, 'users');

// Función para obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(usersCollection);

    const users = snapshot.docs.map(doc => ({
      id: doc.id, 
      email: doc.data().email,
    }));

    return users;  // Devuelve la lista de usuarios
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;  // Lanza el error para que lo maneje quien llame a esta función
  }
};
