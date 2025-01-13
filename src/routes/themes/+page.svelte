<script>
    import {onDestroy, onMount} from "svelte";
    import { authStore } from "../../store/authStore";
    import { themeStore } from "../../store/themeStore";

    let newTheme = {
        title: "",
        description: "",
        imageUrl: "",
        createdBy: "",
    };

    let isEditing = false;
    let editingThemeId = null;
    let showForm = false; // Controla si el formulario está visible

    let user = null;
    let isAdmin = false;
    let isLoading = true;

    // Guardar la función de desuscripción
    let unsubscribeAuth;
    let unsubscribeCheckAuth;

    onMount(() => {
        // Verifica el estado de autenticación y guarda la función de desuscripción
        unsubscribeCheckAuth = authStore.checkAuthState();

        // Suscríbete al estado del authStore
        unsubscribeAuth = authStore.subscribe((value) => {
            user = value.user;
            isAdmin = value.isAdmin;
            isLoading = value.isLoading;

            if (!isLoading && !user) {
                alert("Debes iniciar sesión para gestionar temas.");
                window.location.href = "/login";
            } else if (!isLoading && user) {
                newTheme.createdBy = user.email;
                themeStore.fetchThemes(); // Cargar los temas
            }
        });
    });

    onDestroy(() => {
        // Limpia las suscripciones
        if (unsubscribeAuth) unsubscribeAuth();
        if (unsubscribeCheckAuth) unsubscribeCheckAuth();
    });

    const toggleForm = () => {
        if (showForm && isEditing) {
            // Si estamos en edición y cerramos el formulario, reiniciamos el estado
            isEditing = false;
            editingThemeId = null;
            newTheme = {
                title: "",
                description: "",
                imageUrl: "",
                createdBy: user.email,
            };
        }

        // Alternar visibilidad del formulario
        showForm = !showForm;
    };


    const createTheme = async () => {
        console.log("Creando tema:", newTheme);
        if (!newTheme.title || !newTheme.description) {
            alert("El título y la descripción son obligatorios.");
            return;
        }

        await themeStore.createTheme(
            newTheme.title,
            newTheme.description,
            newTheme.imageUrl,
            newTheme.createdBy
        );

        console.log("Temas después de crear:", $themeStore.themes);

        newTheme = {
            title: "",
            description: "",
            imageUrl: "",
            createdBy: user.email,
        };

        showForm = false; // Ocultar el formulario después de añadir
    };

    const deleteTheme = async (themeId) => {
        if (!isAdmin) {
            alert("No tienes permiso para eliminar temas.");
            return;
        }

        if (confirm("¿Estás seguro de que deseas eliminar este tema?")) {
            await themeStore.deleteTheme(themeId);

            // Reiniciar el estado del formulario
            isEditing = false;
            editingThemeId = null;
            newTheme = {
                title: "",
                description: "",
                imageUrl: "",
                createdBy: user.email,
            };

            // Asegurarte de que el formulario esté oculto
            showForm = false;
        }
    };


    const editTheme = (theme) => {
        isEditing = true;
        editingThemeId = theme.id;
        newTheme = { ...theme };
        showForm = true; // Mostrar el formulario en modo edición
    };

    const updateTheme = async () => {
        if (!newTheme.title || !newTheme.description) {
            alert("El título y la descripción son obligatorios.");
            return;
        }

        await themeStore.updateTheme(editingThemeId, {
            title: newTheme.title,
            description: newTheme.description,
            imageUrl: newTheme.imageUrl,
        });

        isEditing = false;
        editingThemeId = null;
        newTheme = {
            title: "",
            description: "",
            imageUrl: "",
            createdBy: user.email,
        };

        showForm = false; // Ocultar el formulario después de actualizar
    };

    const cancelEdit = () => {
        isEditing = false;
        editingThemeId = null;
        newTheme = {
            title: "",
            description: "",
            imageUrl: "",
            createdBy: user.email,
        };

        showForm = false; // Ocultar el formulario al cancelar
    };
</script>


<style>
    .container {
        max-width: 900px;
        margin: 2rem auto;
        padding: 1.5rem;
        background-color: #1e1e1e;
        color: #e0e0e0;
        border: 1px solid #333;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
    }

    h1 {
        text-align: center;
        color: #ff6666;
        margin-bottom: 2rem;
    }

    .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        border: 1px solid #444;
        border-radius: 8px;
        background-color: #2c2c2c;
    }

    .form input,
    .form textarea {
        padding: 0.8rem;
        border: 1px solid #555;
        border-radius: 6px;
        background-color: #1e1e1e;
        color: #e0e0e0;
    }

    .form textarea {
        resize: none;
    }

    .form button {
        padding: 0.8rem;
        font-size: 1rem;
        font-weight: bold;
        background-color: #ff6666;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .form button:hover {
        background-color: #e05555;
    }

    .theme-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .theme-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem; /* Reducir el espacio entre elementos dentro del contenedor */
        padding: 0.8rem; /* Reducir el relleno del contenedor */
        border: 1px solid #444;
        border-radius: 8px;
        background-color: #2c2c2c;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    }

    .theme-card img {
        max-width: 100%;
        border-radius: 6px;
        margin-bottom: 0.5rem; /* Reducir el espacio debajo de la imagen */
    }

    .theme-card h2 {
        font-size: 1.2rem; /* Reducir el tamaño del título */
        margin: 0.5rem 0; /* Reducir los márgenes verticales del título */
    }

    .theme-card p {
        font-size: 0.9rem; /* Reducir el tamaño del texto descriptivo */
        margin: 0; /* Quitar márgenes verticales */
    }

    .theme-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem; /* Reducir el espacio entre los botones */
        margin-top: 0.5rem; /* Reducir el margen superior */
    }

    .theme-actions button {
        padding: 0.4rem 0.6rem; /* Reducir el relleno de los botones */
        font-size: 0.8rem; /* Reducir el tamaño del texto en los botones */
        border-radius: 4px; /* Ajustar los bordes redondeados */
    }

    .toggle-form-button {
        background-color: #ff6666;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 0.8rem 1.2rem;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s, transform 0.2s;
        margin-bottom: 1rem; /* Espacio adicional debajo del botón */
    }

    .toggle-form-button:hover {
        background-color: #e05555;
        transform: scale(1.05);
    }


</style>

<div class="container">
    <h1>Gestión de Temas</h1>

    <!-- Botón para alternar la visibilidad del formulario -->
    <button class="toggle-form-button" on:click={toggleForm}>
        {#if showForm}
            {isEditing ? "Cancelar Edición" : "Cerrar Formulario"}
        {:else}
            {isEditing ? "Editar Tema" : "Añadir Tema"}
        {/if}
    </button>

    <!-- Formulario para añadir o editar temas -->
    {#if showForm}
        <div class="form">
            <input type="text" placeholder="Título del tema" bind:value={newTheme.title} required />
            <textarea
                    rows="4"
                    placeholder="Descripción del tema"
                    bind:value={newTheme.description}
                    required
            ></textarea>
            <input
                    type="text"
                    placeholder="URL de la imagen (opcional)"
                    bind:value={newTheme.imageUrl}
            />
            {#if isEditing}
                <button on:click={updateTheme}>Actualizar Tema</button>
                <button on:click={cancelEdit} style="background-color: #444;">Cancelar</button>
            {:else}
                <button on:click={createTheme}>Añadir Tema</button>
            {/if}
        </div>
    {/if}

    <!-- Lista de temas -->
    <div class="theme-list">
        {#each $themeStore.themes as theme}
            <div class="theme-card">
                <h2>{theme.title}</h2>
                <p>{theme.description}</p>
                {#if theme.imageUrl}
                    <img src="{theme.imageUrl}" alt="{theme.title}" />
                {/if}
                <p><strong>Creado por:</strong> {theme.createdBy}</p>
                <div class="theme-actions">
                    <button on:click={() => editTheme(theme)}>Editar</button>
                    <button on:click={() => deleteTheme(theme.id)}>Eliminar</button>
                </div>
            </div>
        {/each}
    </div>
</div>

