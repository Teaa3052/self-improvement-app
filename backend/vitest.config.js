import { defineConfig } from 'vitest/config'

// postavke za testove (npm test)
export default defineConfig({
    test: {
        env: { NODE_ENV: 'test' }, // po ovome config.js učita .env.test, tj. testnu bazu
        setupFiles: ['./tests/setup.js'], // pokreće se prije svake testne datoteke: zaštita i čišćenje baze
        fileParallelism: false, // testne datoteke idu jedna po jedna, jer sve dijele istu bazu
    },
})
