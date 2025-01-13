import {
    collection,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    deleteDoc,
    where,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig"; // Configuración de Firebase adaptada

/**
 * Crea un tema con ID automático y una subcolección de chat grupal inicializada
 * - Almacena el título, descripción, URL de imagen, creador y fecha de creación
 * - Añade un mensaje inicial al chat grupal del tema
 * @param {string} title - Título del tema
 * @param {string} description - Descripción del tema
 * @param {string} imageUrl - URL de la imagen del tema
 * @param {string} createdBy - Nombre del usuario que crea el tema
 * @returns {Promise<string>} ID del tema creado
 */
export async function createThemeWithAutoId(title, description, imageUrl, createdBy) {
    const newTheme = {
        title,
        description,
        imageUrl: imageUrl || null, // Usa null si no se proporciona una URL
        createdBy,
        createdAt: new Date(),
    };


    const themeDocRef = await addDoc(collection(db, "Themes"), newTheme);

    // Crear subcolección 'GroupChat' y un mensaje inicial
    const groupChatCollectionRef = collection(themeDocRef, "GroupChat");
    const groupChatDocRef = await addDoc(groupChatCollectionRef, {});
    const messagesCollectionRef = collection(groupChatDocRef, "Messages");
    const firstMessage = {
        message: "Welcome to the group chat!",
        sender: "system",
        timestamp: new Date(),
    };
    await addDoc(messagesCollectionRef, firstMessage);

    return themeDocRef.id;
}

/**
 * Obtiene todos los temas almacenados en Firestore
 * - Recupera los documentos de la colección 'Themes'
 * @returns {Promise<Array>} Lista de temas con sus datos
 */
export async function getThemes() {
    const querySnapshot = await getDocs(collection(db, "Themes"));
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}

/**
 * Actualiza los datos de un tema existente
 * - Identifica el tema por su ID
 * @param {string} themeId - ID del tema a actualizar
 * @param {Object} updatedData - Datos actualizados del tema
 * @returns {Promise<void>} Promesa que indica la finalización de la operación
 */
export async function updateTheme(themeId, updatedData) {
    const themeDoc = doc(db, "Themes", themeId);
    await updateDoc(themeDoc, updatedData);
}

/**
 * Elimina un tema y sus subcolecciones asociadas
 * - Borra los mensajes y el chat grupal del tema antes de eliminar el tema
 * @param {string} themeId - ID del tema a eliminar
 * @returns {Promise<void>} Promesa que indica la finalización de la operación
 */
export async function deleteTheme(themeId) {
    const themeDocRef = doc(db, "Themes", themeId);
    const groupChatCollectionRef = collection(themeDocRef, "GroupChat");
    const groupChatDocs = await getDocs(groupChatCollectionRef);

    for (const groupChatDoc of groupChatDocs.docs) {
        const messagesCollectionRef = collection(groupChatDoc.ref, "Messages");
        const messagesDocs = await getDocs(messagesCollectionRef);

        for (const message of messagesDocs.docs) {
            await deleteDoc(message.ref);
        }
        await deleteDoc(groupChatDoc.ref);
    }

    await deleteDoc(themeDocRef);
}

/**
 * Obtiene una lista paginada de temas
 * - Permite paginar los resultados mediante un documento de referencia
 * @param {number} pageSize - Número de temas por página
 * @param {Object|null} lastVisible - Último documento visible de la página anterior (opcional)
 * @returns {Promise<Object>} Objeto con la lista de temas y el último documento visible
 */
export async function getThemesPaginated(pageSize, lastVisible = null) {
    let themesQuery = query(
        collection(db, "Themes"),
        orderBy("createdAt", "asc"),
        limit(pageSize)
    );

    if (lastVisible) {
        themesQuery = query(
            collection(db, "Themes"),
            orderBy("createdAt", "asc"),
            startAfter(lastVisible),
            limit(pageSize)
        );
    }

    const querySnapshot = await getDocs(themesQuery);
    const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return {
        themes: querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })),
        lastDoc,
    };
}

/**
 * Busca temas que coincidan con el texto de consulta
 * - Filtra los temas por coincidencia en el título
 * @param {string} queryText - Texto de búsqueda
 * @returns {Promise<Array>} Lista de temas que coinciden con la búsqueda
 */
export async function getThemesBySearch(queryText) {
    const q = query(
        collection(db, "Themes"),
        where("title", ">=", queryText),
        where("title", "<=", queryText + "\uf8ff")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}
