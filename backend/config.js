// Jedino mjesto koje čita .env i process.env - ostatak aplikacije uvozi gotov `config` objekt
import dotenv from 'dotenv'
// testovi (NODE_ENV=test, postavlja ga vitest.config.js) čitaju .env.test s testnom bazom, sve ostalo čita .env
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
dotenv.config({ path: envFile, quiet: true }) // učita env datoteku, bez reklamnih poruka u konzoli

// vraća vrijednost obavezne varijable ili odmah ruši server s jasnom porukom (fail fast)
function required(name) {
    const value = process.env[name]
    if (!value) {
        throw new Error(`Missing required env variable: ${name}`)
    }
    return value
}

export const config = {
    port: Number(process.env.PORT) || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    databaseUrl: required('DATABASE_URL'),
    jwtSecret: required('JWT_SECRET'),
    isProduction: process.env.NODE_ENV === 'production', // u produkciji: secure cookie i Express servira frontend
}
