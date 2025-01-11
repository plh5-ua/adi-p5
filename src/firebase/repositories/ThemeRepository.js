import * as themeService from "../services/ThemeService.js";

/**
 * Crea un nuevo tema en la base de datos
 * - Genera un ID automáticamente para el tema
 * - Almacena el título, descripción, URL de la imagen y el creador del tema
 * @param {string} title - Título del tema
 * @param {string} description - Descripción del tema
 * @param {string} imageUrl - URL de la imagen del tema
 * @param {string} createdBy - ID del usuario que crea el tema
 * @returns {Promise<Object>} Resultado de la operación con el ID del tema creado
 */
export async function createTheme(title, description, imageUrl, createdBy) {
    try {
        const themeId = await themeService.createThemeWithAutoId(
            title,
            description,
            imageUrl,
            createdBy
        );
        return { message: "Theme created", themeId };
    } catch (error) {
        throw new Error(`Error in createTheme: ${error.message}`);
    }
}

/**
 * Obtiene todos los temas disponibles en la base de datos
 * - Recupera una lista de temas sin paginación
 * @returns {Promise<Array>} Lista de temas
 */
export async function getAllThemes() {
    try {
        return await themeService.getThemes();
    } catch (error) {
        throw new Error(`Error in getAllThemes: ${error.message}`);
    }
}

/**
 * Actualiza un tema existente en la base de datos
 * - Modifica los datos del tema identificado por su ID
 * @param {string} themeId - ID del tema a actualizar
 * @param {Object} updatedData - Objeto con los datos actualizados del tema
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function updateTheme(themeId, updatedData) {
    try {
        await themeService.updateTheme(themeId, updatedData);
        return { message: "Theme updated" };
    } catch (error) {
        throw new Error(`Error in updateTheme: ${error.message}`);
    }
}

/**
 * Elimina un tema de la base de datos
 * - Identifica el tema por su ID y lo elimina
 * @param {string} themeId - ID del tema a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function deleteTheme(themeId) {
    try {
        await themeService.deleteTheme(themeId);
        return { message: "Theme deleted" };
    } catch (error) {
        throw new Error(`Error in deleteTheme: ${error.message}`);
    }
}

/**
 * Obtiene una lista de temas paginados
 * - Permite la recuperación de temas en lotes de tamaño especificado
 * - Soporta la paginación con un documento de referencia
 * @param {number} pageSize - Número de temas por página
 * @param {Object|null} lastVisible - Último documento visible de la página anterior (opcional)
 * @returns {Promise<Object>} Objeto con la lista de temas y el último documento visible
 */
export async function getPaginatedThemes(pageSize, lastVisible = null) {
    try {
        const result = await themeService.getThemesPaginated(pageSize, lastVisible);
        return {
            themes: result.themes || [],
            lastDoc: result.lastDoc || null,
        };
    } catch (error) {
        throw new Error(`Error in getPaginatedThemes: ${error.message}`);
    }
}

/**
 * Busca temas en la base de datos que coincidan con un texto de consulta
 * - Filtra los temas basándose en el texto proporcionado
 * @param {string} queryText - Texto de búsqueda
 * @returns {Promise<Object>} Objeto con la lista de temas encontrados
 */
export async function searchThemes(queryText) {
    try {
        const result = await themeService.getThemesBySearch(queryText);
        return {
            themes: result || [],
        };
    } catch (error) {
        throw new Error(`Error in searchThemes: ${error.message}`);
    }
}
