import { describe, it, expect, beforeEach } from 'vitest'
import request, { agent } from 'supertest'
import app from '../app.js'

// testovi za registraciju 
describe ('register', () => {
    it ('creates a user with valid data', async () => {
        // pošalji zahtjev za registraciju
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'tea@example.com', password: '123456789', nickname: 'Tea'})

        // provjeri odgovor 
        expect(res.status).toBe(201)
        expect(res.body.user.email).toBe('tea@example.com')
        expect(res.body.user.nickname).toBe('Tea')
        expect(res.body.user.passwordHash).toBeUndefined()
    })

    it ('rejects an email that is already registered', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'tea@example.com', password: '123456789', nickname: 'Tea'})

        // isti email drugi put - mora pasti
        const res = await request(app) // const res znači ''spremi odgovor da ga mogu provjerit'' 
            .post('/api/auth/register')
            .send({ email: 'tea@example.com', password: '123456789', nickname: 'Tea'})

        expect(res.status).toBe(409)
        expect(res.body.message).toBe('User already exists')
    })

    it('rejects too short password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'tea@example.com', password: '12345', nickname: 'Tea'})

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Password is too short')
    })
})

describe('login', () => {
    // prije svakog login testa napravi korisnika s kojim se prijavljujemo
    beforeEach(async() => {
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'tea@example.com', password: '123456789', nickname: 'Tea'})
    })

    it('logs in with the correct password and sets a cookie', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'tea@example.com', password: '123456789'})
        
        expect(res.status).toBe(200)
        expect(res.headers['set-cookie'][0]).toContain('token=')
        expect(res.headers['set-cookie'][0]).toContain('HttpOnly')
    })

    it('rejects a wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'tea@example.com', password: 'abcerf'})

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Invalid email or password')
    })

    //ista poruk za krivu lozinku, da napadač ne može saznati koji emailovi postoje
    it('rejects an email that does not exists', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: '123456789'})

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Invalid email or password')
    })
})


// testovi za /me (tko sam ja) i logout - trebaju agenta koji pamti cookie
describe('me and logout', () => {
    beforeEach(async() => { 
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'tea@example.com', password: '123456789', nickname: 'Tea'})
    })

    it('rejects /me without login', async () => { 
        const res = await request(app).get('/api/auth/me')

        expect(res.status).toBe(401)
        expect(res.body.message).toBe('Not authorized')
    })

    it('returns the user after login', async () => {
        const agent = request.agent(app) // napravi agenta (jedna "kartica" koja pamti cookie)

        // login preko agenta: server vrati cookie, a agent ga spremi
        await agent
            .post('/api/auth/login')
            .send({ email: 'tea@example.com', password: '123456789'})

        // agent sam pošalje spremljeni cookie, pa nas /me prepozna 
        const res = await agent.get('/api/auth/me')

        expect(res.status).toBe(200)
        expect(res.body.user.email).toBe('tea@example.com')
        expect(res.body.user.passwordHash).toBeUndefined()
    })

    // logout mora stvarno odjaviti korisnika, a ne samo vratiti poruku
    it('logs out, so /me is rejected afterwards', async () => {
        const agent = request.agent(app) // "preglednik" koji pamti cookie

        // login: agent spremi cookie s tokenom
        await agent
            .post('/api/auth/login')
            .send({ email: 'tea@example.com', password: '123456789'})

        // logout: server pošalje naredbu da se cookie obriše, a agent ga makne
        await agent
            .post('/api/auth/logout')

        // nakon logouta agent više nema cookie, pa /me mora odbiti 
        const res = await agent.get('/api/auth/me')

        expect(res.status).toBe(401)
    })
})