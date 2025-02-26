# Roadmap de Internacionalización para Magic Typing

Este documento detalla el plan para implementar un sistema multilenguaje en Magic Typing. Servirá como guía de implementación y registro de progreso.

## 1. Fase de Análisis e Infraestructura Inicial

### 1.1 Análisis del Código Existente
- [x] Identificar todos los textos hardcodeados en las escenas
- [x] Mapear las necesidades específicas de cada escena (textos narrativos, instrucciones, UI)
- [x] Analizar posibles desafíos específicos (longitud variable de textos, fuentes para caracteres especiales)

### 1.2 Diseño de la Arquitectura i18n
- [x] Definir estructura de archivos de idioma (JSON)
- [x] Diseñar el servicio central de localización
- [x] Planificar mecanismo de detección/selección de idioma

### 1.3 Preparación de la Infraestructura
- [x] Crear estructura de carpetas para los archivos de idioma
- [x] Implementar el servicio de localización (LocalizationService)
- [x] Crear sistema para cambiar idiomas dinámicamente

## 2. Fase de Extracción e Implementación

### 2.1 Extracción de Textos
- [x] Extraer textos de TitleScene
- [x] Extraer textos de PlayerCustomizationScene
- [x] Extraer textos de IntroScene
- [x] Extraer textos de InstructionsScene
- [x] Extraer textos de GameScene
- [x] Extraer textos de ResultsScene
- [x] Extraer textos de otros componentes o escenas (DifficultyScene, etc.)

### 2.2 Creación de Archivos de Idioma
- [x] Crear archivo base español (es.json)
- [x] Crear archivo base inglés (en.json)
- [x] Preparar estructura para futuros idiomas

### 2.3 Modificación del Código
- [x] Reemplazar textos en TitleScene con llamadas al servicio de localización
- [x] Reemplazar textos en PlayerCustomizationScene
- [x] Reemplazar textos en IntroScene
- [x] Reemplazar textos en InstructionsScene
- [x] Reemplazar textos en GameScene
- [x] Reemplazar textos en ResultsScene
- [x] Reemplazar textos en otras escenas (DifficultyScene)

## 3. Fase de Experiencia de Usuario

### 3.1 Interfaz de Selección de Idioma
- [x] Diseñar selector de idiomas en el menú
- [x] Implementar UI para cambio de idioma
- [x] Guardar preferencias de idioma entre sesiones

### 3.2 Optimizaciones
- [ ] Implementar carga asíncrona de archivos de idioma
- [ ] Optimizar manejo de memoria para archivos de idioma
- [ ] Ajustar elementos de UI para acomodar textos de diferente longitud

## 4. Fase de Pruebas y Refinamiento

### 4.1 Pruebas Generales
- [ ] Probar cambio de idioma en todas las escenas
- [ ] Verificar que todos los textos se visualicen correctamente
- [ ] Probar con un idioma RTL (como árabe) si se planea soportarlo

### 4.2 Edge Cases y Refinamiento
- [ ] Manejar errores de carga de archivos de idioma
- [ ] Implementar fallbacks para textos faltantes
- [ ] Refinamiento visual para diferentes longitudes de texto

### 4.3 Optimización Final
- [ ] Revisar rendimiento
- [ ] Realizar limpieza final del código
- [ ] Documentar el sistema de internacionalización

## 5. Documentación y Entrega

### 5.1 Documentación
- [ ] Documentar estructura de archivos de idioma
- [ ] Crear guía para añadir nuevos idiomas
- [ ] Establecer mejores prácticas para futuras expansiones

### 5.2 Entrega y Cierre
- [ ] Validar funcionamiento completo
- [ ] Presentar demo multilenguaje
- [ ] Planificar próximas adiciones de idioma

## Notas y Progreso

### Idiomas Planificados Inicialmente:
- Español (base)
- Inglés

### Registro de Cambios:
- [FECHA] - Creación del roadmap inicial
- [2023-11-03] - Análisis de textos completo. Identificados todos los textos en las escenas del juego.
- [2023-11-03] - Diseño de la estructura de archivos de idioma y servicio de localización.
- [2023-11-04] - Implementación del servicio de localización y creación de archivos de idioma base (español e inglés).
- [2023-11-05] - Modificación de escenas principales para usar el servicio de localización: TitleScene, PlayerCustomizationScene, IntroScene, InstructionsScene y ResultsScene.
- [2023-11-06] - Finalización de la modificación de todas las escenas para usar el servicio de localización, incluyendo GameScene y DifficultyScene. Fase 2 completada.
- [2023-11-07] - Implementado selector de idiomas en la pantalla de título con cambio dinámico entre español e inglés.

### Notas Técnicas:
- Utilizaremos archivos JSON para almacenar las traducciones
- Se ha implementado un servicio singleton para gestionar las traducciones
- Las claves de traducción siguen la convención: `escena.contexto.identificador`
- Se ha añadido inicialización del servicio de localización al inicio del juego en index.js

### Resultados del Análisis de Textos (1.1):

#### Textos por Escena:
1. **TitleScene**:
   - "PRESIONA ESPACIO PARA COMENZAR"

2. **PlayerCustomizationScene**:
   - "¡PERSONALIZA TU PERSONAJE!"
   - "INGRESA TU NOMBRE:"
   - "ELIGE TU PERSONAJE: (← →)"
   - "PRESIONA ENTER PARA CONTINUAR"

3. **IntroScene**:
   - "¡HOLA! SOY {NOMBRE}"
   - "QUIERO DOMINAR LA MAGIA"
   - "¡PERO PRIMERO DEBO APRENDER A TIPEAR!"
   - "¿ME AYUDAS?"
   - "PRESIONA ESPACIO"

4. **InstructionsScene**:
   - "¡BIENVENIDO A LA AVENTURA!"
   - "ESCRIBE LAS PALABRAS QUE CAEN\nY PRESIONA ENTER\n PARA QUE DESAPAREZCAN"
   - "¡NO DEJES QUE LAS PALABRAS\nLLEGUEN AL PISO!"
   - "PRESIONA ESPACIO PARA CONTINUAR"
   - "¡CADA DEDO DEBE PRESIONAR LAS TECLAS\nDE SU MISMO COLOR!"
   - "PRESIONA ESPACIO PARA COMENZAR"

5. **DifficultyScene**:
   - "ELIGE TU NIVEL DE PODER"
   - "ESTUDIANTE DE MAGIA" (nombre)
   - "Primeros pasos en el arte de la magia" (descripción)
   - "HECHICERO EXPERTO" (nombre)
   - "Dominio avanzado de los hechizos" (descripción)
   - "ARCHIMAGO SUPREMO" (nombre)
   - "Maestría total de las artes místicas" (descripción)
   - "USA ↑↓ PARA ELEGIR\nPULSA ESPACIO O ENTER PARA CONFIRMAR"

6. **GameScene**:
   - "Escribí las palabras que van cayendo\n y luego apretá ENTER"
   - "Puntuación: {score}"
   - "Nivel: {level}"
   - Todos los textos del objeto PALABRAS_POR_NIVEL (palabras a escribir)
   - Descripciones de niveles: "POSICIÓN BASE - SOLO DEDOS ÍNDICES", etc.

7. **ResultsScene**:
   - "¡PARTIDA TERMINADA!"
   - "Nivel alcanzado: {level}\nPuntuación final: {score}"
   - "¡NUEVO HIGH SCORE!"
   - "MEJORES PUNTAJES"
   - "PRESIONA ESPACIO PARA VOLVER AL MENÚ"

#### Desafíos identificados:
1. **Variables en los textos**: Hay placeholders como {NOMBRE}, {score}, {level} que deben preservarse.
2. **Saltos de línea**: Varios textos usan \n para formatear en múltiples líneas.
3. **Longitud de textos**: Los textos en diferentes idiomas pueden tener longitudes variables.
4. **Formateo especial**: Algunos textos tienen formateo especial como mayúsculas o símbolos especiales.
5. **Contexto de juego**: Las palabras a escribir en PALABRAS_POR_NIVEL deben ser adaptadas al idioma.

### Diseño de la Arquitectura i18n (1.2):

#### Estructura de Archivos de Idioma (JSON):

```javascript
// Ejemplo de la estructura para es.json
{
  "metadata": {
    "language": "es",
    "displayName": "Español",
    "direction": "ltr"
  },
  "common": {
    "buttons": {
      "continue": "CONTINUAR",
      "back": "VOLVER",
      "confirm": "CONFIRMAR",
      "pressSpace": "PRESIONA ESPACIO",
      "pressEnter": "PRESIONA ENTER"
    }
  },
  "scenes": {
    "title": {
      "pressStart": "PRESIONA ESPACIO PARA COMENZAR"
    },
    "playerCustomization": {
      "title": "¡PERSONALIZA TU PERSONAJE!",
      "enterName": "INGRESA TU NOMBRE:",
      "chooseCharacter": "ELIGE TU PERSONAJE: (← →)",
      "continue": "PRESIONA ENTER PARA CONTINUAR"
    },
    "intro": {
      "greetings": "¡HOLA! SOY {NOMBRE}",
      "desire": "QUIERO DOMINAR LA MAGIA",
      "challenge": "¡PERO PRIMERO DEBO APRENDER A TIPEAR!",
      "request": "¿ME AYUDAS?",
      "pressSpace": "PRESIONA ESPACIO"
    },
    "instructions": {
      "welcome": "¡BIENVENIDO A LA AVENTURA!",
      "typing": "ESCRIBE LAS PALABRAS QUE CAEN\nY PRESIONA ENTER\n PARA QUE DESAPAREZCAN",
      "warning": "¡NO DEJES QUE LAS PALABRAS\nLLEGUEN AL PISO!",
      "fingers": "¡CADA DEDO DEBE PRESIONAR LAS TECLAS\nDE SU MISMO COLOR!",
      "continue": "PRESIONA ESPACIO PARA CONTINUAR",
      "start": "PRESIONA ESPACIO PARA COMENZAR"
    },
    "difficulty": {
      "title": "ELIGE TU NIVEL DE PODER",
      "levels": {
        "apprentice": {
          "name": "ESTUDIANTE DE MAGIA",
          "description": "Primeros pasos en el arte de la magia"
        },
        "wizard": {
          "name": "HECHICERO EXPERTO",
          "description": "Dominio avanzado de los hechizos"
        },
        "enchanter": {
          "name": "ARCHIMAGO SUPREMO",
          "description": "Maestría total de las artes místicas"
        }
      },
      "controls": "USA ↑↓ PARA ELEGIR\nPULSA ESPACIO O ENTER PARA CONFIRMAR"
    },
    "game": {
      "instructions": "Escribí las palabras que van cayendo\n y luego apretá ENTER",
      "score": "Puntuación: {score}",
      "level": "Nivel: {level}",
      "levels": {
        "1": {
          "description": "POSICIÓN BASE - SOLO DEDOS ÍNDICES",
          "words": ["JU", "FU", "RYU", "VU", "TU", "GY", "MU", "MY", "JUR", "FUR", "RYU", "JUR", "BU", "BY", "HY", "HV"]
        },
        "2": {
          "description": "SOLO DEDOS MEDIOS",
          "words": ["DEDI", "KIKE", "DICE", "DIKE", "DECE", "KEKE", "KIKI", "IKE", "CEDEC"]
        },
        "3": {
          "description": "SOLO DEDOS ANULARES",
          "words": ["SOL", "LOS", "SOX", "WOS", "SOS", "XOXO"]
        },
        "4": {
          "description": "SOLO DEDOS MEÑIQUES",
          "words": ["PAZ", "PAQA", "ZAP", "PAQ", "ÑAZ", "QAPA", "ÑAÑA", "QAP"]
        },
        "5": {
          "description": "COMBINANDO DEDOS ÍNDICES Y MEDIOS",
          "words": ["JUNTE", "VERDE", "TIENE", "MENTE", "VIENE", "DICE", "JEFE", "MIDE", "RINDE", "CINE"]
        },
        "6": {
          "description": "COMBINANDO DEDOS ÍNDICES, MEDIOS Y ANULARES",
          "words": ["SENDERO", "VENTILE", "CLIENTE", "SILENCIO", "DESTINO", "VECINOS", "SEMILLA", "DECIRLE", "SERVIR", "MIELES"]
        },
        "7": {
          "description": "USANDO TODOS LOS DEDOS - ¡PALABRAS MÁGICAS!",
          "words": ["MAGIA", "POCION", "VARITA", "HECHIZO", "MISTICA", "CONJURO", "MAGICO", "PORTAL", "BRUJA", "WIZARD"]
        }
      }
    },
    "results": {
      "gameOver": "¡PARTIDA TERMINADA!",
      "summary": "Nivel alcanzado: {level}\nPuntuación final: {score}",
      "newHighScore": "¡NUEVO HIGH SCORE!",
      "leaderboard": "MEJORES PUNTAJES",
      "returnToMenu": "PRESIONA ESPACIO PARA VOLVER AL MENÚ"
    }
  }
}
```

#### Diseño del Servicio de Localización Implementado:

La clase `LocalizationService` ha sido implementada como un servicio singleton con las siguientes características:

1. **Carga asíncrona** de archivos de idioma
2. **Caché** de traducciones para evitar recargas innecesarias
3. **Interpolación de variables** para reemplazar placeholders como {nombre}, {score}, etc.
4. **Fallback automático** al español si el idioma solicitado no existe
5. **Gestión de preferencias** guardando el idioma seleccionado en localStorage
6. **Sistema de eventos** para notificar cambios de idioma a componentes de la aplicación
7. **Detección automática** del idioma del navegador (con fallback a español)
