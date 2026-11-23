import { beforeAll, beforeEach, afterAll } from 'vitest'
import pool from '../database.js'

// Pokreće se prije svake testne datoteke (setupFiles u vitest.config.js).

// zaštita: testovi brišu podatke, pa smiju raditi samo na bazi čije ime završava na _test
beforeAll(async () => {
    const result = await pool.query('SELECT current_database() AS name')
    const name = result.rows[0].name
    if (!name.endsWith('_test')) {
        throw new Error(`Tests must use a *_test database, not "${name}"`)
    }
})

// prije svakog testa isprazni tablice, da svaki test kreće od prazne baze i ne ovisi o drugima
// RESTART IDENTITY vrati id-eve na 1, CASCADE briše i retke koji pokazuju na obrisane
beforeEach(async () => {
    await pool.query('TRUNCATE habit_logs, habits, users RESTART IDENTITY CASCADE')
})

// nakon zadnjeg testa u datoteci zatvori veze s bazom, da Vitest može uredno završiti
afterAll(async () => {
    await pool.end()
})
