<script>
    import { onMount } from "svelte";
    import { authStore } from "../../store/authStore";
    import { nodeStore } from "../../store/nodeStore";
    import { themeStore } from "../../store/themeStore";

    let nodes = [];
    let themes = []; // Lista de temas disponibles para el desplegable
    let newNode = {
        title: "",
        description: "",
        themeId: "",
        createdBy: "",
    };

    let isEditing = false;
    let editingNodeId = null;
    let showForm = false;

    let user = null;
    let isAdmin = false;

    authStore.subscribe((value) => {
        user = value.user;
        isAdmin = value.isAdmin;
    });

    onMount(() => {
        authStore.checkAuthState();

        const unsubscribe = authStore.subscribe((auth) => {
            if (!auth.isLoading) {
                if (!auth.user) {
                    alert("Debes iniciar sesión para gestionar nodos.");
                    window.location.href = "/login";
                } else {
                    user = auth.user;
                    isAdmin = auth.isAdmin;
                    newNode.createdBy = user.email;

                    // Cargar temas y nodos
                    themeStore.fetchThemes();
                    themeStore.subscribe((value) => {
                        themes = value.themes;
                    });

                    nodeStore.fetchNodes();
                    nodeStore.subscribe((value) => {
                        nodes = value;
                    });
                }
            }
        });

        return () => unsubscribe(); // Limpia la suscripción al desmontar
    });


    const toggleForm = () => {
        if (showForm && isEditing) {
            isEditing = false;
            editingNodeId = null;
            newNode = {
                title: "",
                content: "",
                themeId: "",
                createdBy: user.email,
            };
        }
        showForm = !showForm;
    };

    const createNode = async () => {
        if (!newNode.title || !newNode.content || !newNode.themeId) {
            alert("El título, el contenido y el tema son obligatorios.");
            return;
        }

        try {
            await nodeStore.saveNode({
                title: newNode.title,
                content: newNode.content,
                createdBy: user.uid, // El UID del usuario actual
                themeId: newNode.themeId, // El ID del tema seleccionado
            });

            // Resetear el formulario
            newNode = {
                title: "",
                content: "",
                themeId: "",
                createdBy: user.email,
            };

            showForm = false; // Ocultar el formulario
            alert("Nodo creado con éxito.");
        } catch (error) {
            console.error("Error al crear el nodo:", error);
            alert("Hubo un error al crear el nodo.");
        }
    };




    const editNode = (node) => {
        isEditing = true;
        editingNodeId = node.id;
        newNode = { ...node };
        showForm = true;
    };

    const updateNode = async () => {
        if (!newNode.title || !newNode.content || !newNode.themeId) {
            alert("El título, el contenido y el tema son obligatorios.");
            return;
        }

        const updatedData = {
            ...newNode,
            updatedAt: new Date().toISOString(),
        };

        try {
            await nodeStore.saveNode(updatedData);
            isEditing = false;
            editingNodeId = null;
            newNode = {
                title: "",
                content: "",
                themeId: "",
                createdBy: user.email,
            };

            showForm = false;
        } catch (error) {
            console.error("Error al actualizar el nodo:", error);
            alert("Hubo un error al actualizar el nodo.");
        }
    };


    const cancelEdit = () => {
        isEditing = false;
        editingNodeId = null;
        newNode = {
            title: "",
            description: "",
            themeId: "",
            createdBy: user.email,
        };
        showForm = false;
    };

    const deleteNode = async (nodeId) => {
        if (!isAdmin) {
            alert("No tienes permiso para eliminar nodos.");
            return;
        }

        if (confirm("¿Estás seguro de que deseas eliminar este nodo?")) {
            try {
                await nodeStore.deleteNode(nodeId); // Llama al método deleteNode
                alert("Nodo eliminado con éxito.");
            } catch (error) {
                console.error("Error al eliminar nodo:", error.message);
            }
        }
    };

</script>



<style>
    .node-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .node-card {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.8rem;
        border: 1px solid #444;
        border-radius: 8px;
        background-color: #2c2c2c;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    }

    .node-card h2 {
        font-size: 1.2rem;
        margin: 0.5rem 0;
    }

    .node-card p {
        font-size: 0.9rem;
        margin: 0;
    }

    .node-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        margin-top: 0.5rem;
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
    <h1>Gestión de Nodos</h1>

    <!-- Botón para alternar la visibilidad del formulario -->
    <button class="toggle-form-button" on:click={toggleForm}>
        {#if showForm}
            {isEditing ? "Cancelar Edición" : "Cerrar Formulario"}
        {:else}
            {isEditing ? "Editar Nodo" : "Añadir Nodo"}
        {/if}
    </button>

    {#if showForm}
        <div class="form">
            <h2>{isEditing ? "Editar Nodo" : "Añadir Nodo"}</h2>
            <input
                    type="text"
                    placeholder="Título del nodo"
                    bind:value={newNode.title}
                    required
            />
            <textarea
                    rows="4"
                    placeholder="Contenido del nodo"
                    bind:value={newNode.content}
                    required
            ></textarea>
            <label>
                Tema Relacionado:
                <select bind:value={newNode.themeId} required>
                    <option value="" disabled selected>Selecciona un tema</option>
                    {#each themes as theme}
                        <option value={theme.id}>{theme.title}</option>
                    {/each}
                </select>
            </label>
            <div class="form-actions">
                {#if isEditing}
                    <button on:click={updateNode}>Actualizar Nodo</button>
                    <button on:click={cancelEdit} style="background-color: #444;">Cancelar</button>
                {:else}
                    <button on:click={createNode}>Añadir Nodo</button>
                    <button on:click={toggleForm} style="background-color: #444;">Cerrar</button>
                {/if}
            </div>
        </div>
    {/if}


    <!-- Lista de nodos -->
    <div class="node-list">
        {#each nodes as node}
            <div class="node-card">
                <h2>{node.title || "Nodo sin título"}</h2>
                <p><strong>Contenido:</strong> {node.content || "Sin contenido"}</p>
                <p><strong>Tema:</strong> {node.themeId || "Sin tema asociado"}</p>
                <p><strong>Creado por:</strong> {node.createdBy || "Desconocido"}</p>
                <div class="node-actions">
                    <button on:click={() => editNode(node)}>Editar</button>
                    <button on:click={() => deleteNode(node.id)}>Eliminar</button>
                </div>
            </div>
        {/each}
    </div>
</div>

