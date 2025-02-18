const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Cargar variables de entorno en orden de prioridad
const loadEnvVars = () => {
    console.log('\n=== Loading Environment Variables ===');
    
    // 1. Cargar .env.development.local
    const localEnv = dotenv.config({ path: '.env.development.local' }).parsed || {};
    console.log('Variables from .env.development.local:', Object.keys(localEnv));
    
    // 2. Cargar .env si existe
    const defaultEnv = dotenv.config({ path: '.env' }).parsed || {};
    console.log('Variables from .env:', Object.keys(defaultEnv));
    
    // 3. Combinar con process.env
    const finalEnv = {
        ...defaultEnv,
        ...localEnv,
        ...process.env
    };
    
    console.log('Final environment config:', {
        NODE_ENV: finalEnv.NODE_ENV,
        EDGE_CONFIG: finalEnv.EDGE_CONFIG ? 'exists' : 'missing'
    });
    
    return finalEnv;
};

const env = loadEnvVars();

const envVars = {
    'process.env': JSON.stringify({
        NODE_ENV: env.NODE_ENV || 'development',
        START_SCENE: env.START_SCENE || null,
        EDGE_CONFIG: env.EDGE_CONFIG,
        VERCEL_API_TOKEN: env.VERCEL_API_TOKEN,
        // Game specific variables
        VELOCIDAD_BASE: env.VELOCIDAD_BASE,
        FRECUENCIA_SPAWN: env.FRECUENCIA_SPAWN,
        INCREMENTO_VELOCIDAD: env.INCREMENTO_VELOCIDAD,
        INCREMENTO_FRECUENCIA: env.INCREMENTO_FRECUENCIA,
        PALABRAS_POR_NIVEL: env.PALABRAS_POR_NIVEL,
        PUNTOS_POR_LETRA: env.PUNTOS_POR_LETRA
    })
};

console.log('Webpack DefinePlugin vars:', {
    env: JSON.parse(envVars['process.env'])
});
console.log('=== Webpack Environment Setup Complete ===');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '' }
            ]
        }),
        new webpack.DefinePlugin(envVars)
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8080,
    },
    mode: 'development'
}; 