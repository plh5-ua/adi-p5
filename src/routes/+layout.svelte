<script>
    import { onMount } from "svelte";
    import { authStore } from "../store/authStore"; // Ajusta esto según tu implementación
    let currentPath = "";
    let isLoggedIn = false;

    // Detectar la ruta actual
    onMount(() => {
        currentPath = window.location.pathname;
    });

    // Suscribirse al estado de autenticación
    $: isLoggedIn = $authStore?.user != null;

    const logout = async () => {
        await authStore.logout();
        window.location.href = "/"; // Redirigir tras cerrar sesión
    };

    const isActive = (path) => currentPath === path || currentPath.startsWith(path);
</script>

<style>
    /* Fondo general oscuro */
    :global(html) {
        background-color: #121212; /* Fondo oscuro */
        color: #e0e0e0; /* Texto claro */
        height: 100%;
    }

    :global(body) {
        background-color: #121212; /* Fondo oscuro */
        color: #e0e0e0;
        margin: 0;
        padding: 0;
        font-family: 'Arial', sans-serif;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    header {
        background-color: #1e1e1e;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem 1rem;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        left: 0;
        right: 0; /* Barra fija con ancho completo */
        z-index: 1000;
    }

    nav {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem; /* Espaciado uniforme entre los botones */
    }

    nav a {
        text-decoration: none;
        color: #e0e0e0;
        font-size: 0.9rem;
        font-weight: bold;
        padding: 0.5rem 0.8rem;
        border-radius: 4px;
        background-color: transparent;
        transition: background-color 0.3s, color 0.3s;
    }

    nav a:hover {
        background-color: rgba(255, 0, 0, 0.2);
        color: #ff0000;
    }

    nav a.active {
        background-color: rgba(255, 0, 0, 0.5);
        color: white;
    }

    main {
        margin-top: 3rem; /* Espacio para la barra superior fija */
        padding: 1rem;
        width: 60%;
        margin: 3rem auto 0;
        background: transparent; /* Fondo transparente para evitar el blanco */
        border-radius: 8px;
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
        flex: 1; /* Asegura que ocupe el espacio restante */
    }

    footer {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.8rem;
        color: #888;
    }

    :global(button) {
        background-color: #ff6666; /* Fondo rojo */
        color: white; /* Texto blanco */
        border: none; /* Sin borde */
        border-radius: 6px; /* Bordes redondeados */
        padding: 0.5rem 1rem; /* Relleno */
        font-size: 0.9rem; /* Tamaño de fuente */
        font-weight: bold; /* Texto en negrita */
        cursor: pointer; /* Cursor de clic */
        transition: background-color 0.3s, transform 0.2s; /* Transición suave */
    }

    :global(button:hover) {
        background-color: #e05555; /* Más oscuro al pasar el ratón */
        transform: scale(1.05); /* Efecto de agrandamiento ligero */
    }

    :global(button:active) {
        transform: scale(0.95); /* Efecto de clic */
    }

    :global(button:disabled) {
        background-color: #555; /* Fondo gris para botones deshabilitados */
        cursor: not-allowed; /* Cursor no permitido */
        opacity: 0.7; /* Más transparente */
    }

</style>

<header>
    <nav>
        <a href="/" class:active={isActive("/")}>Home</a>
        <a href="/nodes" class:active={isActive("/nodes")}>Nodes</a>
        <a href="/themes" class:active={isActive("/themes")}>Themes</a>
        {#if isLoggedIn}
            <a on:click={logout} style="cursor: pointer;">Logout</a>
        {:else}
            <a href="/login" class:active={isActive("/login")}>Login</a>
        {/if}
    </nav>
</header>

<main>
    <slot />
</main>

<footer>
    <p>&copy; {new Date().getFullYear()} Sangre del Código. Todos los derechos reservados.</p>
</footer>
