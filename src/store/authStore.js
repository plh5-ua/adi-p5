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
                }));
            } catch (error) {
                throw new Error("Error al iniciar sesión: " + error.message);
            }
        },
        async logout() {
            try {
                await logoutService();
                set({ user: null, isAdmin: false });
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
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const uid = user.uid;
                    let isAdmin = false;

                    try {
                        const userDocRef = doc(db, "users", uid);
                        const userDoc = await getDoc(userDocRef);

                        if (userDoc.exists()) {
                            isAdmin = userDoc.data().admin || false;
                        }
                    } catch (error) {
                        console.error("Error al obtener información del usuario:", error);
                    }

                    set({ user, isAdmin });
                } else {
                    set({ user: null, isAdmin: false });
                }
            });
        },
    };
};

export const authStore = createAuthStore();
