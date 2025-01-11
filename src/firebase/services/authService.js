import { auth,db } from '../config/firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Función para registrar un nuevo usuario
// Permite registrar un usuario con su correo electrónico y contraseña utilizando Firebase Auth
// - Parámetros:
//   - 'email' (string): Dirección de correo electrónico del usuario
//   - 'password' (string): Contraseña del usuario
// - Devuelve el usuario registrado en caso de éxito
const registrarUsuario = async (email, password) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Usuario registrado:', cred.user);
    return cred.user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw new Error(error.message);
  }
};

// Función para iniciar sesión
// Permite a un usuario iniciar sesión con su correo electrónico y contraseña
// - Parámetros:
//   - 'email' (string): Dirección de correo electrónico del usuario
//   - 'password' (string): Contraseña del usuario
// - Eventos Procesados:
//   - Autenticación del usuario
//   - Obtención de datos adicionales del usuario desde Firestore
// -  Devuelve los datos del usuario junto con su rol de administrador ('isAdmin')
const login = async (email, password) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('Inicio de sesión exitoso:', cred.user);

    const uid = cred.user.uid;

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    let isAdmin = false; 
    if (userDoc.exists()) {
      const userData = userDoc.data();
      isAdmin = userData.admin || false; 
    } else {
      console.log('El usuario no existe en Firestore');
    }

    return { ...cred.user, isAdmin };

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw new Error(error.message);
  }
};

// Función para cerrar sesión
// Finaliza la sesión del usuario actual
// - Eventos Procesados: Desconexión del usuario
const logout = async () => {
  try {
    await signOut(auth);
    console.log('Usuario cerrado sesión');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw new Error(error.message);
  }
};

// Función para enviar el correo de restablecimiento de contraseña
// Envía un correo electrónico para que el usuario restablezca su contraseña
// - Parámetros:
//   - 'email' (string): Dirección de correo electrónico del usuario
// - Eventos Procesados: Envía un correo electrónico desde Firebase Auth
const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Correo de restablecimiento enviado a', email);
  } catch (error) {
    console.error('Error al enviar el correo de restablecimiento:', error);
    throw new Error('No se pudo enviar el correo de restablecimiento. Por favor, intenta de nuevo.');
  }
};

export { registrarUsuario, login, logout, sendPasswordReset };
