import { collection, doc, getDoc, getDocs, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from "../config/firebaseConfig";

const nodesCollection = collection(db, 'Nodes');

/**
 * Obtiene todos los nodos de la colección "Nodes"
 * - Itera sobre cada documento de la colección
 * - Resuelve referencias de 'createdBy' y 'themeId'
 * - Convierte el campo 'createdAt' a formato de fecha
 * @returns {Promise<Array>} Lista de nodos procesados
 */
export const getAllNodes = async () => {
  try {
    const snapshot = await getDocs(nodesCollection);
    const nodes = [];

    for (const docSnap of snapshot.docs) {
      const nodeData = docSnap.data();
      const node = { id: docSnap.id, ...nodeData };

      if (node.createdAt) {
        const date = node.createdAt.toDate(); 
        node.createdAt = date.toLocaleDateString(); 
      } else {
        node.createdAt = "Unkown date";
      }

      if (node.createdBy) {
        const createdByDoc = await getDoc(node.createdBy);
        node.createdBy = createdByDoc.exists() ? createdByDoc.data().email || "Unknown" : "Unknown";
      } else {
        node.createdBy = "Unknown";
      }

      if (node.themeId) {
        const themeDoc = await getDoc(node.themeId);
        node.themeId = themeDoc.exists() ? themeDoc.data().title || "No Theme" : "No Theme";
      } else {
        node.themeId = "No Theme";
      }

      nodes.push(node);
    }

    return nodes;
  } catch (error) {
    console.error('Failed to get nodes:', error);
    throw new Error('Failed to get nodes.');
  }
};

/**
 * Obtiene un nodo específico por su ID
 * - Resuelve referencias de 'createdBy' y 'themeId'
 * - Convierte el campo 'createdAt' a formato fecha
 * @param {string} id - ID del nodo a obtener
 * @returns {Promise<Object>} Nodo procesado
 */
export const getNodeById = async (node) => {
  try {
    const nodeDoc = doc(db, 'Nodes', id);
    const snapshot = await getDoc(nodeDoc);

    if (!snapshot.exists()) {
      throw new Error('Node does not exist.');
    }

    const node = { id: snapshot.id, ...snapshot.data() };

    if (node.createdBy) {
      const createdByDoc = await getDoc(node.createdBy);
      node.createdBy = createdByDoc.exists() ? createdByDoc.data().email || "Unknown" : "Unknown";
    } else {
      node.createdBy = "Unknown";
    }

    if (node.themeId) {
      const themeDoc = await getDoc(node.themeId);
      node.themeId = themeDoc.exists() ? themeDoc.data().title || "No Theme" : "No Theme";
    } else {
      node.themeId = "No Theme";
    }

    if (node.createdAt) {
      const date = node.createdAt.toDate(); 
      node.createdAt = date.toLocaleDateString(); 
    } else {
      node.createdAt = "Unknown date";
    }

    return node;
  } catch (error) {
    console.error('Failed to get node:', error);
    throw error;
  }
};

/**
 * Guarda un nodo nuevo o actualiza uno existente
 * - Si el nodo tiene un ID, lo actualiza
 * - Si no tiene ID, lo crea como un nuevo documento
 * @param {Object} node - Objeto con los datos del nodo
 * @returns {Promise<Object>} Resultado de la operación
 */
export const saveNode = async (node) => {
  try {
    let nodeDocRef;

    // Validar referencias
    const createdByRef = node.createdBy ? doc(db, "users", node.createdBy) : null;
    const themeIdRef = node.themeId ? doc(db, "Themes", node.themeId) : null;

    if (!createdByRef || !themeIdRef) {
      throw new Error("createdBy o themeId son inválidos.");
    }

    if (node.id) {
      // Actualizar nodo existente
      nodeDocRef = doc(db, "Nodes", node.id);
      await updateDoc(nodeDocRef, {
        title: node.title,
        content: node.content,
        createdBy: createdByRef,
        themeId: themeIdRef,
        updatedAt: new Date(),
      });
    } else {
      // Crear nuevo nodo
      await addDoc(nodesCollection, {
        title: node.title,
        content: node.content,
        createdBy: createdByRef,
        themeId: themeIdRef,
        createdAt: new Date(),
      });
    }

    console.log("Nodo guardado correctamente.");
    return { success: true };
  } catch (error) {
    console.error("Failed to save node:", error);
    throw error;
  }
};

/**
 * Obtiene los datos de un nodo por su ID
 * @param {string} nodeId - ID del nodo
 * @returns {Promise<Object|null>} Nodo si existe, o null
 */
export const getNode = async (nodeId) => {
  const nodeDocRef = doc(db, 'Nodes', nodeId);
  try {
    const snapshot = await getDoc(nodeDocRef);
    if (snapshot.exists()) {
      return snapshot.data(); 
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to get node:", error);
    return null; 
  }
};

/**
 * Elimina un nodo por su ID
 * @param {string} nodeId - ID del nodo a eliminar
 * @returns {Promise<void>} - Promesa que se resuelve al completar la eliminación
 */
export const deleteNode = async (nodeId) => {
  try {
    const nodeDocRef = doc(db, "Nodes", nodeId); // Referencia al nodo en Firestore
    await deleteDoc(nodeDocRef); // Eliminar el documento
    console.log(`Nodo con ID ${nodeId} eliminado.`);
  } catch (error) {
    console.error("Error al eliminar nodo:", error);
    throw new Error("Error al eliminar el nodo.");
  }
};
