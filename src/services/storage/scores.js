import { config } from './config';

const HIGHSCORES_KEY = 'highscores';
const MAX_SCORES = 10;

export const HighScores = {
    // Obtener los highscores guardados
    get: async () => {
        try {
            const scores = await config.get(HIGHSCORES_KEY);
            return scores || [];
        } catch (error) {
            console.error('Error getting scores:', error);
            return [];
        }
    },

    // Agregar un nuevo score
    add: async (score) => {
        try {
            console.log('=== Adding Score ===');
            console.log('Input score:', score);
            
            let scores = await HighScores.get();
            console.log('Current scores:', scores);
            
            const newScore = {
                name: score.name,
                score: score.score,
                date: new Date().toISOString()
            };
            console.log('New score object:', newScore);
            
            scores = [...scores, newScore]
                .sort((a, b) => b.score - a.score)
                .slice(0, MAX_SCORES);
            console.log('Updated scores array:', scores);

            const result = await config.set(HIGHSCORES_KEY, scores);
            console.log('Set result:', result);
            
            return scores;
        } catch (error) {
            console.error('Error adding score:', error);
            return [];
        }
    },

    // Verificar si un score califica para el highscore
    isHighScore: async (score) => {
        try {
            const scores = await HighScores.get();
            console.log('Verificando highscore:', score);
            console.log('Scores actuales:', scores);

            // Si hay menos de 5 scores, cualquier score es highscore
            if (scores.length < 5) {
                console.log('Menos de 5 scores, es highscore');
                return true;
            }

            // Ordenar scores de mayor a menor
            const sortedScores = [...scores].sort((a, b) => b.score - a.score);
            const lowestScore = sortedScores[4].score;  // El 5to score (índice 4)
            
            console.log('Score más bajo actual:', lowestScore);
            console.log('Es highscore:', score > lowestScore);
            
            return score > lowestScore;
        } catch (error) {
            console.error('Error checking high score:', error);
            return false;  // En caso de error, no es highscore
        }
    },

    // Limpiar todos los scores
    clear: () => {
        config.del(HIGHSCORES_KEY);
    }
};

// Solo para debug
window.HighScores = HighScores; 