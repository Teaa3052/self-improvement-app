import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../app.js'

// provjera da testna postava radi: supertest šalje zahtjev aplikaciji izravno, bez pokretanja servera
describe('unknown route', () => {
    it('returns 404 with a JSON message', async () => {
        const res = await request(app).get('/api/does-not-exist')

        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Route not found: GET /api/does-not-exist')
    })
})
