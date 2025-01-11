import { writable } from "svelte/store";
import {
  getAllNodes,
  getNodeById,
  saveNode,
  deleteNode as deleteNodeInFirebase,
} from "../firebase/repositories/nodeRepository";

function createNodeStore() {
  const { subscribe, set, update } = writable([]);

  // fetchNodes: Cargar nodos desde Firebase
  const fetchNodes = async () => {
    try {
      const nodes = await getAllNodes(); // Usa la función de nodeRepository
      set(nodes); // Actualiza el estado del store
    } catch (error) {
      console.error("Error al obtener nodos:", error.message);
    }
  };

  // getNodeById: Obtener un nodo específico
  const getNodeByIdFromStore = async (nodeId) => {
    try {
      return await getNodeById(nodeId); // Usa la función de nodeRepository
    } catch (error) {
      console.error("Error al obtener nodo:", error.message);
      return null;
    }
  };

  // saveNode: Crear o actualizar un nodo
  const saveNodeToStore = async (node) => {
    try {
      const result = await saveNode(node); // Usa la función de nodeRepository
      if (result.success) {
        await fetchNodes(); // Refresca los nodos después de guardar
      } else {
        console.error("Error al guardar nodo:", result.error);
      }
    } catch (error) {
      console.error("Error al guardar nodo:", error.message);
    }
  };

  // deleteNode: Eliminar un nodo
  const deleteNode = async (nodeId) => {
    try {
      await deleteNodeInFirebase(nodeId); // Usa la función de nodeRepository
      await fetchNodes(); // Refresca los nodos después de eliminar
    } catch (error) {
      console.error("Error al eliminar nodo:", error.message);
    }
  };

  return {
    subscribe,
    fetchNodes,
    getNodeById: getNodeByIdFromStore,
    saveNode: saveNodeToStore,
    deleteNode,
  };
}

export const nodeStore = createNodeStore();
