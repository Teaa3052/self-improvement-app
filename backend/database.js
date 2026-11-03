import pg from 'pg' // uvoz PostgreSQL modula 
const { Pool } = pg // destrukturiranje da dohvatimo klasu Pool 

import { config } from './config.js' // postavke iz .env (učitava ih config.js)

//kreiranje bazena konekcija pomoću .env postavki
const pool = new Pool({
    connectionString: config.databaseUrl
})

// veza koja miruje u poolu može puknuti (npr. kad se Neon uspava); bez ovoga bi takva greška srušila cijeli server
pool.on('error', (err) => {
    console.error('Idle database connection error:', err.message)
})


// funkcija koja testira vezu s bazom
async function testConnection() {
    const res = await pool.query('SELECT NOW()') // upit za trenutno vrijeme
    console.log('Database connected:', res.rows[0].now) // ispis rezultata
}

// ako se ne možemo spojiti na bazu, nema smisla da server radi (fail fast)
testConnection().catch((err) => {
    console.error('Database connection failed:', err.message)
    process.exit(1)
})

export default pool // izvoz poola da ga druge datoteke mogu koristit 