// Servicio para gestionar highscores localmente

// Nombre de la clave en localStorage
const STORAGE_KEY = 'letras_magicas_highscores';

// Obtener los puntajes guardados
export function getHighScores() {
    try {
        const scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        return scores;
    } catch (error) {
        console.error('Error al cargar highscores:', error);
        return [];
    }
}

// Guardar un nuevo puntaje y retornar los 5 mejores
export function saveHighScore(playerName, score, level) {
    try {
        // Obtener puntajes existentes
        const highscores = getHighScores();
        
        // Agregar nuevo puntaje
        highscores.push({
            name: playerName,
            score: score,
            level: level,
            date: new Date().toISOString()
        });
        
        // Ordenar por puntaje (mayor a menor)
        highscores.sort((a, b) => b.score - a.score);
        
        // Mantener solo los 5 mejores
        const top5 = highscores.slice(0, 5);
        
        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
        
        // Devolver el índice del nuevo puntaje (o -1 si no entró en el top 5)
        const newScoreIndex = top5.findIndex(item => 
            item.name === playerName && 
            item.score === score && 
            item.level === level
        );
        
        return {
            scores: top5,
            newScoreIndex,
            isNewHighScore: newScoreIndex !== -1
        };
    } catch (error) {
        console.error('Error al guardar highscore:', error);
        return {
            scores: [],
            newScoreIndex: -1,
            isNewHighScore: false
        };
    }
}

// Comprobar si un puntaje entraría en el top 5
export function isHighScore(score) {
    const highscores = getHighScores();
    
    // Si hay menos de 5 puntajes, cualquier puntaje es un highscore
    if (highscores.length < 5) {
        return true;
    }
    
    // Si el puntaje es mayor que el menor del top 5, es un highscore
    return score > highscores[highscores.length - 1].score;
} 