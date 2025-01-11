// Importar Firebase en formato compat para usar ESM
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// Configuración de Firebase
// Este objeto contiene las credenciales necesarias para conectar la aplicación con el proyecto de firebase
const firebaseConfig = {
    apiKey: "AIzaSyBaSGmRQjAR0B3el_tKgK-mIU0Mns9BjMY",  // Clave de la API
    authDomain: "nodality-47c38.firebaseapp.com", // Dominio de autenticación
    projectId: "nodality-47c38", // ID del proyecto en Firebase
    storageBucket: "nodality-47c38.appspot.com", // Bucket de almacenamiento para subir archivos
    messagingSenderId: "258860610070", // ID del remitente de mensajes
    appId: "1:258860610070:web:d6376ee68f401b7becbb37", // ID único de la aplicación
};

// Inicializar Firebase
// Este paso conecta la configuración con Firebase, permitiendo que la aplicación utilice los servicios
const app = firebase.initializeApp(firebaseConfig);

// Inicializar Firestore y Auth
// Exportamos las instancias de Firestore y Auth para usarlas en otros módulos
export const db = firebase.firestore(); // Base de datos en tiempo real de Firebase
export const auth = firebase.auth(); // Servicio de autenticación de Firebase
