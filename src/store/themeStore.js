// src/store/themeStore.js
import { writable } from "svelte/store";
import {
    getAllThemes,
    createTheme,
    deleteTheme,
    updateTheme,
} from "../firebase/repositories/ThemeRepository";
import {doc, getDoc} from "firebase/firestore";
import {db} from "../firebase/config/firebaseConfig.js";

function createThemeStore() {
    const { subscribe, set, update } = writable({
        themes: [],
        currentTheme: null,
        isLoading: false,
        error: null,
    });

    return {
        subscribe,

        // Fetch all themes
        async fetchThemes() {
            update((state) => ({ ...state, isLoading: true, error: null }));
            try {
                const themes = await getAllThemes();
                update((state) => ({ ...state, themes, isLoading: false }));
            } catch (error) {
                console.error("Error fetching themes:", error);
                update((state) => ({
                    ...state,
                    isLoading: false,
                    error: "Error al cargar los temas.",
                }));
            }
        },

        // Create a new theme
        async createTheme(title, description, imageUrl, createdBy) {
            update((state) => ({ ...state, isLoading: true, error: null }));
            try {
                // Crear el tema y obtener su ID
                const { themeId } = await createTheme(title, description, imageUrl, createdBy);

                // Recuperar el tema recién creado desde Firestore
                const themeDocRef = doc(db, "Themes", themeId);
                const themeDoc = await getDoc(themeDocRef);

                if (themeDoc.exists()) {
                    const newTheme = { id: themeId, ...themeDoc.data() };

                    // Actualizar el store con el tema completo
                    update((state) => ({
                        ...state,
                        themes: [...state.themes, newTheme],
                        isLoading: false,
                    }));
                } else {
                    throw new Error("No se pudo recuperar el tema recién creado.");
                }
            } catch (error) {
                console.error("Error creating theme:", error);
                update((state) => ({
                    ...state,
                    isLoading: false,
                    error: "Error al crear el tema.",
                }));
            }
        }
        ,

        // Delete a theme
        async deleteTheme(themeId) {
            update((state) => ({ ...state, isLoading: true, error: null }));
            try {
                await deleteTheme(themeId);
                update((state) => ({
                    ...state,
                    themes: state.themes.filter((theme) => theme.id !== themeId),
                    isLoading: false,
                }));
            } catch (error) {
                console.error("Error deleting theme:", error);
                update((state) => ({
                    ...state,
                    isLoading: false,
                    error: "Error al eliminar el tema.",
                }));
            }
        },

        // Update a theme
        async updateTheme(themeId, updatedData) {
            //console.log("Updating theme with data: ", updatedData);
            update((state) => ({ ...state, isLoading: true, error: null }));
            try {
                await updateTheme(themeId, updatedData);
                update((state) => {
                    const themes = state.themes.map((theme) =>
                        theme.id === themeId ? { ...theme, ...updatedData } : theme
                    );
                    return { ...state, themes, isLoading: false };
                });
            } catch (error) {
                console.error("Error updating theme:", error);
                update((state) => ({
                    ...state,
                    isLoading: false,
                    error: "Error al actualizar el tema.",
                }));
            }
        },

        // Select a theme by ID
        selectTheme(themeId) {
            update((state) => ({
                ...state,
                currentTheme: state.themes.find((theme) => theme.id === themeId) || null,
            }));
        },

        // Clear the currently selected theme
        clearCurrentTheme() {
            update((state) => ({ ...state, currentTheme: null }));
        },
    };
}

export const themeStore = createThemeStore();
