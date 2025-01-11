<script>
    import { authStore } from "../store/authStore";
    import { onMount } from "svelte";

    let user = null;

    // Suscribirse al estado del usuario
    authStore.subscribe((value) => {
        user = value.user;
    });

    onMount(() => {
        // Verifica el estado del usuario al cargar la página
        authStore.checkAuthState();
    });
</script>

<style>
    .container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 2rem;
        background-color: #1e1e1e;
        color: #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
        text-align: center;
    }

    h1 {
        color: #ff6666;
        font-size: 2rem;
    }

    p {
        font-size: 1.2rem;
        margin: 1rem 0;
    }

    .button {
        padding: 0.8rem 1.5rem;
        font-size: 1rem;
        font-weight: bold;
        background-color: #ff6666;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s;
        margin-top: 1rem;
        text-decoration: none;
    }

    .button:hover {
        background-color: #e05555;
    }
</style>

<div class="container">
    {#if user}
        <h1>Bienvenido, {user.email}!</h1>
        <p>Explora las funcionalidades de tu cuenta. Puedes gestionar nodos, temas y mucho más.</p>
        <a href="/nodes" class="button">Ir a Nodos</a>
        <a href="/themes" class="button" style="margin-left: 1rem;">Ir a Temas</a>
    {:else}
        <h1>Bienvenido a la Aplicación</h1>
        <p>Por favor, inicia sesión para comenzar a usar todas las funcionalidades.</p>
        <a href="/login" class="button">Iniciar Sesión</a>
    {/if}
</div>
