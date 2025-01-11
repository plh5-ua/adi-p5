// src/store/nodeStore.js
import { writable } from "svelte/store";
import { db } from "../firebase/config/firebaseConfig";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { getAllNodes } from "../firebase/repositories/nodeRepository";

// Estado inicial
function createNodeStore() {
  const { subscribe, set, update } = writable([]);

  // fetchUserAndThemeDetails
  const fetchUserAndThemeDetails = async (createdById, themeId) => {
    try {
      const userDoc = await getDoc(doc(db, "users", createdById));
      const userEmail = userDoc.exists() ? userDoc.data().email : null;

      const themeDoc = await getDoc(doc(db, "Themes", themeId));
      const themeTitle = themeDoc.exists() ? themeDoc.data().title : null;

      return { userEmail, themeTitle };
    } catch (error) {
      console.error("Error al obtener detalles de usuario o tema:", error.message);
      return { userEmail: null, themeTitle: null };
    }
  };

  // formatNodeData
  const formatNodeData = async (node) => {
    const { createdBy, themeId } = node;
    const { userEmail, themeTitle } = await fetchUserAndThemeDetails(createdBy.id, themeId.id);

    return {
      ...node,
      createdAt: node.createdAt ? node.createdAt.toDate().toLocaleDateString() : null,
      createdBy: userEmail,
      themeId: themeTitle,
    };
  };

  // fetchNodes
  const fetchNodes = async () => {
    try {
      const nodes = await getAllNodes();
      set(nodes);
    } catch (error) {
      console.error("Error al obtener nodos:", error.message);
    }
  };

  // getNodeById
  const getNodeById = async (nodeId) => {
    try {
      const nodeDoc = doc(db, "Nodes", nodeId);
      const nodeSnapshot = await getDoc(nodeDoc);
      const nodeData = nodeSnapshot.data();
      return await formatNodeData({ id: nodeSnapshot.id, ...nodeData });
    } catch (error) {
      console.error("Error al obtener nodo:", error.message);
    }
  };

  // deleteNode
  const deleteNode = async (nodeId) => {
    try {
      const nodeDoc = doc(db, "Nodes", nodeId);
      await deleteDoc(nodeDoc);
      await fetchNodes(); // Actualizar nodos después de eliminar
    } catch (error) {
      console.error("Error al eliminar nodo:", error.message);
    }
  };

  return {
    subscribe,
    fetchNodes,
    getNodeById,
    deleteNode,
  };
}

export const nodeStore = createNodeStore();
