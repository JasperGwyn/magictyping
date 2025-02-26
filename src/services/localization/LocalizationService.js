/**
 * Servicio de localización para Magic Typing
 * Maneja la carga, cambio y obtención de textos traducidos
 */
class LocalizationService {
    constructor() {
        // Idioma por defecto
        this.currentLanguage = 'en';
        // Objeto para almacenar traducciones cargadas
        this.translations = {};
        // Bandera para indicar si los archivos de idioma están cargados
        this.isLoaded = false;
        // Evento para notificar cambios de idioma
        this.events = {
            onLanguageChanged: []
        };
        // Ruta utilizada para cargar archivos de idioma
        this.localePath = 'src/services/localization/locales';
        console.log('[i18n] LocalizationService inicializado con idioma por defecto:', this.currentLanguage);
    }

    // Implementación del patrón Singleton
    static getInstance() {
        if (!LocalizationService.instance) {
            LocalizationService.instance = new LocalizationService();
        }
        return LocalizationService.instance;
    }

    /**
     * Resuelve la mejor ruta para cargar archivos de idioma
     * @param {string} lang - Código del idioma
     * @returns {Promise<string>} - La mejor ruta encontrada
     */
    async findBestLocalePath(lang) {
        console.log('[i18n] Buscando la mejor ruta para archivos de idioma...');
        
        // Intentar cargar desde objetos JavaScript importados directamente
        try {
            // Intento dinámico usando import()
            console.log('[i18n] Intentando importar directamente el módulo de idioma');
            try {
                const module = await import(`./locales/${lang}.json`);
                if (module && module.default) {
                    console.log('[i18n] ¡Éxito! Módulo importado directamente');
                    this.translations[lang] = module.default;
                    this.currentLanguage = lang;
                    this.isLoaded = true;
                    return null; // No necesitamos path para fetch
                }
            } catch (importError) {
                console.log('[i18n] No se pudo importar el módulo directamente:', importError.message);
            }
        } catch (e) {
            console.log('[i18n] Error en la importación dinámica:', e.message);
        }
        
        // Lista de rutas a probar con fetch
        const possiblePaths = [
            `src/services/localization/locales/${lang}.json`,
            `assets/locales/${lang}.json`,
            `/src/services/localization/locales/${lang}.json`,
            `/assets/locales/${lang}.json`,
            `./src/services/localization/locales/${lang}.json`,
            `./assets/locales/${lang}.json`,
            `locales/${lang}.json`,
            `./${lang}.json`
        ];
        
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`[i18n] Ruta válida encontrada: ${path}`);
                    // Extraer solo la ruta base sin el idioma.json
                    const basePath = path.replace(`/${lang}.json`, '');
                    this.localePath = basePath;
                    return path;
                }
            } catch (e) {
                // Continuar con la siguiente ruta
            }
        }
        
        console.warn('[i18n] No se encontró una ruta válida para los archivos de idioma. Usando la ruta por defecto.');
        return `${this.localePath}/${lang}.json`;
    }

    /**
     * Carga un archivo de idioma
     * @param {string} lang - Código del idioma a cargar
     * @returns {Promise<boolean>} - Éxito de la carga
     */
    async loadLanguage(lang) {
        console.log(`[i18n] Intentando cargar idioma: ${lang}`);
        
        try {
            // Evitar recargar si ya está en caché
            if (this.translations[lang]) {
                console.log(`[i18n] Idioma ${lang} ya está cargado en caché, reutilizando`);
                this.currentLanguage = lang;
                return true;
            }

            // Intentar encontrar la mejor ruta
            const filePath = await this.findBestLocalePath(lang);
            
            // Si filePath es null, significa que las traducciones se cargaron directamente
            if (filePath === null) {
                console.log(`[i18n] Traducciones para ${lang} ya fueron cargadas directamente`);
                return true;
            }
            
            console.log(`[i18n] Intentando cargar desde: ${filePath}`);
            
            const response = await fetch(filePath);
            console.log(`[i18n] Respuesta fetch para ${filePath}:`, response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`No se pudo cargar el idioma ${lang} (${response.status}: ${response.statusText})`);
            }
            
            const data = await response.json();
            console.log(`[i18n] Datos JSON recibidos para ${lang}:`, Object.keys(data));
            
            this.translations[lang] = data;
            this.currentLanguage = lang;
            this.isLoaded = true;
            console.log(`[i18n] Idioma ${lang} cargado exitosamente`);
            return true;
        } catch (error) {
            console.error(`[i18n] Error cargando idioma ${lang}:`, error);
            
            // Imprimir más información sobre el error
            if (error instanceof TypeError) {
                console.error('[i18n] Error de red o CORS. Verifique la ruta y los permisos.');
            }
            
            // Mostrar todas las traducciones actualmente disponibles
            console.log('[i18n] Traducciones actuales disponibles:', Object.keys(this.translations));
            
            // Si falló cargar el idioma solicitado pero no es el inglés, intentar cargar inglés
            if (lang !== 'en' && !this.translations['en']) {
                console.log('[i18n] Intentando cargar idioma inglés como fallback');
                return this.loadLanguage('en');
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
        console.log(`[i18n] Solicitando cambio de idioma a: ${lang}`);
        // Verificar si el idioma solicitado es diferente al actual
        if (this.currentLanguage === lang && this.translations[lang]) {
            console.log(`[i18n] Ya estamos en idioma ${lang}, no es necesario cambiar`);
            return true;
        }

        // Cargar el idioma si no está cargado
        const success = await this.loadLanguage(lang);
        if (success) {
            // Guardar preferencia en localStorage
            this._saveLanguagePreference(lang);
            // Notificar cambio de idioma
            this._notifyLanguageChanged();
            console.log(`[i18n] Idioma cambiado exitosamente a ${lang}`);
            return true;
        }
        console.log(`[i18n] No se pudo cambiar al idioma ${lang}`);
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
            console.warn(`[i18n] No hay traducciones cargadas para ${this.currentLanguage}. isLoaded=${this.isLoaded}`);
            console.log('[i18n] Traducciones disponibles:', Object.keys(this.translations));
            return this._interpolateParams(key, params);
        }

        const keys = key.split('.');
        let result = this.translations[this.currentLanguage];
        
        // Para depuración, imprimir la primera parte de la estructura
        console.log(`[i18n] Buscando clave '${key}' en idioma ${this.currentLanguage}`);
        console.log(`[i18n] Estructura de traducciones disponible:`, 
            Object.keys(this.translations[this.currentLanguage]));
        
        // Navegar por la estructura de claves
        for (const k of keys) {
            if (!result || typeof result !== 'object' || !(k in result)) {
                console.warn(`[i18n] Parte de la clave '${k}' no encontrada en '${key}'`);
                // Intentar fallback al inglés si la clave no existe y no estamos en inglés
                if (this.currentLanguage !== 'en' && this.translations['en']) {
                    console.log(`[i18n] Intentando fallback a inglés para la clave: ${key}`);
                    return this._getTextWithFallback(key, params);
                }
                console.warn(`[i18n] Clave de traducción no encontrada: ${key}`);
                return this._interpolateParams(key, params);
            }
            result = result[k];
        }
        
        // Si el resultado no es un string, devolver la clave
        if (typeof result !== 'string') {
            console.warn(`[i18n] La clave ${key} no corresponde a un texto, es un: ${typeof result}`);
            return key;
        }
        
        // Reemplazar parámetros
        const final = this._interpolateParams(result, params);
        console.log(`[i18n] Texto obtenido para '${key}':`, final);
        return final;
    }

    /**
     * Intenta obtener un texto con fallback al inglés
     * @private
     */
    _getTextWithFallback(key, params) {
        const keys = key.split('.');
        let result = this.translations['en'];
        
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
     * @returns {string} - Código de idioma detectado o 'en' por defecto
     */
    detectBrowserLanguage() {
        try {
            const browserLang = navigator.language || navigator.userLanguage;
            const lang = browserLang.split('-')[0]; // Obtener solo la parte principal (es-ES -> es)
            
            // Si el idioma está entre los soportados, usarlo
            if (['es', 'en'].includes(lang)) {
                return lang;
            }
            
            return 'en'; // Fallback a inglés
        } catch (e) {
            console.warn('Error al detectar idioma del navegador', e);
            return 'en';
        }
    }

    /**
     * Función de diagnóstico para probar diferentes rutas de carga
     * @param {string} lang - Código del idioma a probar
     * @returns {Promise<void>}
     */
    async testLocaleLoading(lang = 'en') {
        console.log('[i18n] Iniciando prueba de carga de archivos de idioma');
        
        // Lista de rutas posibles para probar
        const paths = [
            `src/services/localization/locales/${lang}.json`,
            `assets/locales/${lang}.json`,
            `/src/services/localization/locales/${lang}.json`,
            `/assets/locales/${lang}.json`,
            `./src/services/localization/locales/${lang}.json`,
            `./assets/locales/${lang}.json`,
            `locales/${lang}.json`,
            `./${lang}.json`,
            `../${lang}.json`
        ];
        
        console.log('[i18n] Probando las siguientes rutas:', paths);
        
        for (const path of paths) {
            try {
                console.log(`[i18n] Intentando cargar: ${path}`);
                const response = await fetch(path);
                console.log(`[i18n] Respuesta para ${path}:`, {
                    status: response.status,
                    ok: response.ok,
                    statusText: response.statusText
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`[i18n] ¡Éxito! Datos cargados desde ${path}:`, Object.keys(data));
                }
            } catch (error) {
                console.error(`[i18n] Error al cargar ${path}:`, error.message);
            }
        }
        
        console.log('[i18n] Prueba de carga completada');
    }

    /**
     * Inicializa el servicio de localización
     * Carga el idioma preferido o detecta el del navegador
     */
    async initialize() {
        console.log('[i18n] Inicializando servicio de localización');
        
        // Ejecutar prueba de carga para diagnosticar problemas
        await this.testLocaleLoading();
        
        // Intentar cargar preferencia guardada
        const savedLang = this.loadLanguagePreference();
        console.log('[i18n] Preferencia de idioma guardada:', savedLang);
        
        if (savedLang) {
            console.log(`[i18n] Usando preferencia guardada: ${savedLang}`);
            await this.loadLanguage(savedLang);
        } else {
            // Detectar idioma del navegador
            const browserLang = this.detectBrowserLanguage();
            console.log(`[i18n] No hay preferencia guardada. Idioma detectado del navegador: ${browserLang}`);
            await this.loadLanguage(browserLang);
        }
        
        console.log('[i18n] Estado final tras inicialización:');
        console.log(`[i18n] - Idioma actual: ${this.currentLanguage}`);
        console.log(`[i18n] - isLoaded: ${this.isLoaded}`);
        console.log(`[i18n] - Idiomas disponibles: ${Object.keys(this.translations)}`);
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

    /**
     * Inicializa el servicio manualmente con traducciones proporcionadas
     * Útil si la carga de archivos falla
     * @param {Object} translations - Objeto con las traducciones por idioma
     * @param {string} defaultLang - Idioma por defecto a establecer
     */
    initializeWithTranslations(translations, defaultLang = 'en') {
        console.log('[i18n] Inicializando servicio manualmente con traducciones proporcionadas');
        this.translations = translations;
        this.currentLanguage = defaultLang;
        this.isLoaded = true;
        console.log(`[i18n] Servicio inicializado manualmente con idioma: ${defaultLang}`);
        console.log('[i18n] Idiomas disponibles:', Object.keys(this.translations));
        
        // Notificar cambio de idioma
        this._notifyLanguageChanged();
        
        return true;
    }
}

export default LocalizationService; 