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
            return scores.length < MAX_SCORES || score > scores[scores.length - 1]?.score;
        } catch (error) {
            console.error('Error checking high score:', error);
            return true; // En caso de error, permitir el highscore
        }
    },

    // Limpiar todos los scores
    clear: () => {
        config.del(HIGHSCORES_KEY);
    }
};

// Solo para debug
window.HighScores = HighScores; 