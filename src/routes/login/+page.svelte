<script>
    import { authStore } from "../../store/authStore.js";
    import { onMount } from "svelte";

    let email = "";
    let password = "";
    let errorMessage = "";

    // Verificar el estado de autenticación al cargar la página
    onMount(() => {
        authStore.checkAuthState();
    });

    // Función para manejar el inicio de sesión
    const login = async () => {
        errorMessage = "";
        try {
            await authStore.login(email, password);
            console.log("Inicio de sesión exitoso");
        } catch (error) {
            errorMessage = error.message || "Error al iniciar sesión";
            console.error(errorMessage);
        }
    };

    // Función para manejar el cierre de sesión
    const logout = async () => {
        try {
            await authStore.logout();
            console.log("Cierre de sesión exitoso");
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
        }
    };
</script>

<style>
    body {
        background-color: #121212; /* Fondo oscuro */
        color: #e0e0e0; /* Texto claro */
    }

    h1 {
        text-align: center;
        margin-bottom: 1rem;
        color: #ff6666; /* Resalta el título */
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 400px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: #1e1e1e; /* Fondo oscuro del formulario */
        border: 1px solid #333;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    }

    input {
        padding: 0.75rem;
        border: 1px solid #555;
        border-radius: 4px;
        background-color: #2c2c2c; /* Fondo oscuro para el input */
        color: #e0e0e0; /* Texto claro */
        font-size: 1rem;
    }

    input:focus {
        border-color: #ff6666; /* Resalta el borde al enfocar */
        outline: none;
        box-shadow: 0 0 4px #ff6666;
    }

    button {
        padding: 0.75rem;
        font-size: 1rem;
        font-weight: bold;
        background-color: #ff6666; /* Botón rojo */
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button:hover {
        background-color: #e05555; /* Cambia el color al pasar el ratón */
    }

    button:disabled {
        background-color: #444;
        cursor: not-allowed;
    }

    .error {
        color: #ff6666;
        font-size: 0.9rem;
        text-align: center;
    }
</style>

<!-- Mostrar el estado del usuario -->
{#if $authStore.user}
    <h1>Bienvenido, {$authStore.user.email}!</h1>
    <button on:click={logout}>Cerrar sesión</button>
{:else}
    <h1>Iniciar Sesión</h1>
    <form on:submit|preventDefault={login}>
        <input
                type="email"
                bind:value={email}
                placeholder="Correo electrónico"
                required
        />
        <input
                type="password"
                bind:value={password}
                placeholder="Contraseña"
                required
        />
        <button type="submit">Iniciar sesión</button>
        {#if errorMessage}
            <p class="error">{errorMessage}</p>
        {/if}
    </form>
{/if}
