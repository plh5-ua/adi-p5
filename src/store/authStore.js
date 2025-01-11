// src/store/authStore.js
import { writable } from "svelte/store";
import { auth, db } from "../firebase/config/firebaseConfig";
import {
    login as loginService,
    logout as logoutService,
    sendPasswordReset as sendPasswordResetService,
} from "../firebase/services/authService";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Estado inicial
const createAuthStore = () => {
    const { subscribe, set, update } = writable({
        user: null,
        isAdmin: false,
        isLoading: true,
    });

    return {
        subscribe,
        async login(email, password) {
            try {
                const userData = await loginService(email, password);
                update((state) => ({
                    ...state,
                    user: userData,
                    isAdmin: userData.isAdmin,
                    isLoading: false,
                }));
            } catch (error) {
                throw new Error("Error al iniciar sesión: " + error.message);
            }
        },
        async logout() {
            try {
                await logoutService();
                update((state) => ({ ...state, user: null, isAdmin: false }));
            } catch (error) {
                throw new Error("Error al cerrar sesión: " + error.message);
            }
        },
        async resetPassword(email) {
            try {
                await sendPasswordResetService(email);
                console.log("Correo de restablecimiento enviado a:", email);
            } catch (error) {
                throw new Error(
                    "Error al enviar el correo de restablecimiento: " + error.message
                );
            }
        },
        checkAuthState() {
            update((state) => ({ ...state, isLoading: true }));
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                try {
                    if (user) {
                        const uid = user.uid;
                        let isAdmin = false;

                        const userDocRef = doc(db, "users", uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            isAdmin = userDoc.data().admin || false;
                        }

                        set({ user, isAdmin, isLoading: false });
                    } else {
                        set({ user: null, isAdmin: false, isLoading: false });
                    }
                } catch (error) {
                    console.error("Error en checkAuthState:", error);
                    set({ user: null, isAdmin: false, isLoading: false });
                }
            });

            return unsubscribe; // Para limpieza, si es necesario
        },
    };
};

export const authStore = createAuthStore();

