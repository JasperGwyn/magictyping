/**
 * Servicio de localización para Magic Typing
 * Maneja la carga, cambio y obtención de textos traducidos
 */
class LocalizationService {
    constructor() {
        // Idioma por defecto
        this.currentLanguage = 'es';
        // Objeto para almacenar traducciones cargadas
        this.translations = {};
        // Bandera para indicar si los archivos de idioma están cargados
        this.isLoaded = false;
        // Evento para notificar cambios de idioma
        this.events = {
            onLanguageChanged: []
        };
    }

    // Implementación del patrón Singleton
    static getInstance() {
        if (!LocalizationService.instance) {
            LocalizationService.instance = new LocalizationService();
        }
        return LocalizationService.instance;
    }

    /**
     * Carga un archivo de idioma
     * @param {string} lang - Código del idioma a cargar
     * @returns {Promise<boolean>} - Éxito de la carga
     */
    async loadLanguage(lang) {
        try {
            // Evitar recargar si ya está en caché
            if (this.translations[lang]) {
                this.currentLanguage = lang;
                return true;
            }

            const response = await fetch(`assets/locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`No se pudo cargar el idioma ${lang}`);
            }
            
            this.translations[lang] = await response.json();
            this.currentLanguage = lang;
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error(`Error cargando idioma ${lang}:`, error);
            // Si falló cargar el idioma solicitado pero no es el español, intentar cargar español
            if (lang !== 'es' && !this.translations['es']) {
                console.log('Intentando cargar idioma español como fallback');
                return this.loadLanguage('es');
            }
            return false;
        }
    }

    /**
     * Cambia el idioma actual
     * @param {string} lang - Código del idioma a establecer
     * @returns {Promise<boolean>} - Éxito del cambio
     */
    async changeLanguage(lang) {
        // Verificar si el idioma solicitado es diferente al actual
        if (this.currentLanguage === lang && this.translations[lang]) {
            return true;
        }

        // Cargar el idioma si no está cargado
        const success = await this.loadLanguage(lang);
        if (success) {
            // Guardar preferencia en localStorage
            this._saveLanguagePreference(lang);
            // Notificar cambio de idioma
            this._notifyLanguageChanged();
            return true;
        }
        return false;
    }

    /**
     * Obtiene un texto traducido por su clave
     * @param {string} key - Clave de traducción (format: 'escena.contexto.identificador')
     * @param {Object} params - Parámetros para interpolar en el texto
     * @returns {string} - Texto traducido o la clave si no se encuentra
     */
    getText(key, params = {}) {
        // Verificar si hay traducciones cargadas
        if (!this.isLoaded || !this.translations[this.currentLanguage]) {
            console.warn(`No hay traducciones cargadas para ${this.currentLanguage}`);
            return this._interpolateParams(key, params);
        }

        const keys = key.split('.');
        let result = this.translations[this.currentLanguage];
        
        // Navegar por la estructura de claves
        for (const k of keys) {
            if (!result || typeof result !== 'object' || !(k in result)) {
                // Intentar fallback al español si la clave no existe y no estamos en español
                if (this.currentLanguage !== 'es' && this.translations['es']) {
                    return this._getTextWithFallback(key, params);
                }
                console.warn(`Clave de traducción no encontrada: ${key}`);
                return this._interpolateParams(key, params);
            }
            result = result[k];
        }
        
        // Si el resultado no es un string, devolver la clave
        if (typeof result !== 'string') {
            console.warn(`La clave ${key} no corresponde a un texto`);
            return key;
        }
        
        // Reemplazar parámetros
        return this._interpolateParams(result, params);
    }

    /**
     * Intenta obtener un texto con fallback al español
     * @private
     */
    _getTextWithFallback(key, params) {
        const keys = key.split('.');
        let result = this.translations['es'];
        
        for (const k of keys) {
            if (!result || typeof result !== 'object' || !(k in result)) {
                return this._interpolateParams(key, params);
            }
            result = result[k];
        }
        
        if (typeof result !== 'string') {
            return key;
        }
        
        return this._interpolateParams(result, params);
    }

    /**
     * Reemplaza los parámetros en un texto
     * @private
     */
    _interpolateParams(text, params) {
        if (typeof text !== 'string' || !params || Object.keys(params).length === 0) {
            return text;
        }
        
        let result = text;
        Object.entries(params).forEach(([param, value]) => {
            result = result.replace(new RegExp(`{${param}}`, 'g'), value);
        });
        
        return result;
    }

    /**
     * Guarda la preferencia de idioma en localStorage
     * @private
     */
    _saveLanguagePreference(lang) {
        try {
            localStorage.setItem('magicTyping_language', lang);
        } catch (e) {
            console.warn('No se pudo guardar la preferencia de idioma', e);
        }
    }

    /**
     * Carga la preferencia de idioma desde localStorage
     * @returns {string|null} - Código de idioma guardado o null si no hay
     */
    loadLanguagePreference() {
        try {
            return localStorage.getItem('magicTyping_language');
        } catch (e) {
            console.warn('No se pudo cargar la preferencia de idioma', e);
            return null;
        }
    }

    /**
     * Detecta el idioma del navegador
     * @returns {string} - Código de idioma detectado o 'es' por defecto
     */
    detectBrowserLanguage() {
        try {
            const browserLang = navigator.language || navigator.userLanguage;
            const lang = browserLang.split('-')[0]; // Obtener solo la parte principal (es-ES -> es)
            
            // Si el idioma está entre los soportados, usarlo
            if (['es', 'en'].includes(lang)) {
                return lang;
            }
            
            return 'es'; // Fallback a español
        } catch (e) {
            console.warn('Error al detectar idioma del navegador', e);
            return 'es';
        }
    }

    /**
     * Inicializa el servicio de localización
     * Carga el idioma preferido o detecta el del navegador
     */
    async initialize() {
        // Intentar cargar preferencia guardada
        const savedLang = this.loadLanguagePreference();
        
        if (savedLang) {
            await this.loadLanguage(savedLang);
        } else {
            // Detectar idioma del navegador
            const browserLang = this.detectBrowserLanguage();
            await this.loadLanguage(browserLang);
        }
    }

    /**
     * Registra una función para ser notificada cuando cambie el idioma
     * @param {Function} callback - Función a llamar al cambiar idioma
     */
    onLanguageChanged(callback) {
        if (typeof callback === 'function') {
            this.events.onLanguageChanged.push(callback);
        }
    }

    /**
     * Notifica a los suscriptores sobre un cambio de idioma
     * @private
     */
    _notifyLanguageChanged() {
        this.events.onLanguageChanged.forEach(callback => {
            try {
                callback(this.currentLanguage);
            } catch (e) {
                console.error('Error en callback de cambio de idioma', e);
            }
        });
    }
}

export default LocalizationService; 