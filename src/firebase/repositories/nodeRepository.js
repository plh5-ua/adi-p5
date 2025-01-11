import { collection, doc, getDoc, getDocs, updateDoc, addDoc } from 'firebase/firestore';
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
    
        if (node.id) {
          nodeDocRef = doc(db, 'Nodes', node.id);
    
          const currentNodeSnapshot = await getDoc(nodeDocRef);
          const currentNode = currentNodeSnapshot.data();

          const createdByRef = node.createdBy && node.createdBy.id ? doc(db, 'users', node.createdBy.id) : (currentNode.createdBy ? doc(db, 'users', currentNode.createdBy.id) : null);
          const themeIdRef = node.themeId && node.themeId.id ? doc(db, 'Themes', node.themeId.id) : (currentNode.themeId ? doc(db, 'Themes', currentNode.themeId.id) : null);
    
          await updateDoc(nodeDocRef, {
            title: node.title,
            content: node.content,
            createdBy: createdByRef,
            themeId: themeIdRef,
          });
        } else {
          const newNodeRef = await addDoc(collection(db, 'Nodes'), {
            title: node.title,
            content: node.content,
            createdAt: node.createdAt,
            createdBy: node.createdBy ? doc(db, 'users', node.createdBy.id) : null,
            themeId: node.themeId ? doc(db, 'Themes', node.themeId.id) : null,
          });
    
          nodeDocRef = newNodeRef;
        }
    
        return { success: true };
      } catch (error) {
        console.error("Failed to save node:", error);
        return { success: false, error: error.message };
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
