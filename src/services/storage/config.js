import { createClient } from '@vercel/edge-config';

console.log('=== Edge Config Initialization ===');

// Función segura para verificar variables de entorno
const checkEnvVars = () => {
    console.log('=== Checking Environment Variables ===');
    const vars = {
        NODE_ENV: process.env.NODE_ENV,
        EDGE_CONFIG: process.env.EDGE_CONFIG,
        VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN
    };
    
    // Logs más detallados
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Edge Config URL:', vars.EDGE_CONFIG ? 'Set' : 'Missing');
    console.log('API Token:', vars.VERCEL_API_TOKEN ? 'Set' : 'Missing');
    
    const hasConfig = !!vars.EDGE_CONFIG && !!vars.VERCEL_API_TOKEN;
    console.log('Config Status:', hasConfig ? 'Complete' : 'Incomplete');
    
    return {
        hasConfig,
        env: vars.NODE_ENV || 'unknown'
    };
};

const { hasConfig, env } = checkEnvVars();
console.log('Environment:', { env, hasConfig });

let configClient;

if (hasConfig) {
    console.log('Using Edge Config via API');
    const BASE_URL = process.env.EDGE_CONFIG;
    const API_URL = `https://api.vercel.com/v1/edge-config/ecfg_0kolhtoyeg0ajyk2s5yvd9weqrnr/items`;
    const API_TOKEN = process.env.VERCEL_API_TOKEN;

    configClient = {
        get: async (key) => {
            console.log('=== Edge Config GET ===');
            const response = await fetch(BASE_URL);
            const data = await response.json();
            console.log(`GET ${key}:`, data.items[key]);
            return data.items[key];
        },
        set: async (key, value) => {
            console.log('=== Edge Config SET ===');
            console.log(`Setting ${key}:`, value);

            const response = await fetch(API_URL, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: [{
                        operation: 'upsert',
                        key: key,
                        value: value
                    }]
                })
            });

            const responseData = await response.json();
            console.log('API Response:', responseData);

            if (!response.ok) {
                throw new Error(`Failed to set config: ${response.status}`);
            }

            return true;
        },
        del: async (key) => {
            console.log(`=== Edge Config DELETE ${key} ===`);
            const response = await fetch(`${API_URL}/${key}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete config');
            return true;
        }
    };
} else {
    throw new Error('Edge Config not configured correctly');
}

console.log('=== Edge Config Initialization Complete ===');

export const config = configClient; 