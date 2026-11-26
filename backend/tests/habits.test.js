import { describe, it, expect, beforeEach, toHaveLength } from 'vitest'
import request, { agent } from 'supertest'
import app from '../app.js'

describe('habits', () => {
    let agent // prijavljeni "preglednik": beforeEach ga napravi, testovi ga koriste

    beforeEach(async () => {
        // napravi korisnika; .expect (201) ruši test ako registracija ne prođe
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'tea@example.com', password: '123456789', nickname: 'Tea'})
            .expect(201)
        
        agent = request.agent(app) // puni gornji let agent; s const bi nastala nova varijabla koja "zasjeni" vanjsku (shadowing)

        // .expect(200) ruši test ako login ne prođe 
        await agent
            .post('/api/auth/login')
            .send({ email: 'tea@example.com', password: '123456789'})
            .expect(200)
    })

    it('creates a habit', async () => {
        // prijavljeni agent šalje novu naviku
        const res = await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'daily'})

        expect(res.status).toBe(201)
        expect(res.body.habit.name).toBe('Read')
        expect(res.body.habit.frequency).toBe('daily')
    })

    it('rejects an invalid frequency', async () => {
        // navika s freknvencijom koja ne postoji - mora past 
        const res = await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'yearly'})

        expect(res.status).toBe(400)
        expect(res.body.message).toBe('Invalid frequency')
    })

    it('lists my habits', async () => {
        // napravi jednu naviku
        await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'daily'})

        // pitaj popis navika
        const res = await agent.get('/api/habits?today=2026-11-24')

        expect(res.status).toBe(200)
        expect(res.body.habits).toHaveLength(1)
        expect(res.body.habits[0].name).toBe('Read')
    })

    // najvažniji sigurnosni test: korisnik ne smije vidjeti tuđe navike
    it('does not show habits of other users', async () => {
        // 1. ja (agent) napravim svoju naviku 'Read'
        await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'daily'})

        // 2. drugi korisnik: register s drugim emailom, pa svoj agent i login
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'other@example.com', password: '123456789', nickname: 'other' })
        
        const otherAgent = request.agent(app) // drugi korisnik dobije svoj "preglednik" i prijavi se u njemu

        await otherAgent
            .post('/api/auth/login')
            .send({ email: 'other@example.com', password: '123456789'})

        // drugi korisnik napravi svoju naviku; .expect(201) ruši test ako nije nastala
        await otherAgent
            .post('/api/habits')
            .send({ name: 'Run', frequency: 'daily'})
            .expect(201)

        // ja pitam popis - moram vidjeti samo svoju naviku 
        const res = await agent.get('/api/habits?today=2026-11-24')
        
        expect(res.status).toBe(200)
        expect(res.body.habits).toHaveLength(1)
        expect(res.body.habits[0].name).toBe('Read')
    })

    it('reguires login', async () => {
        const res = await request(app)
            .get('/api/habits?today=2026-11-24')

        expect(res.status).toBe(401)
    })

    it('marks a habit as done', async () => {
        // napravi naviku i zapamti njezin id
        const created = await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'daily' })
            .expect(201)
        const id = created.body.habit.id

        // označi je za 24.11.2026.
        await agent
            .put(`/api/habits/${id}/logs/2026-11-24`) // backtickove `` koristim kad u adresu trebam ubaciti vrijednost varijable; tako da se odmah vidi gdje je varijabla 
            .expect(204)

        // popis za taj dan - navika mora biti označena 
        const res = await agent.get('/api/habits?today=2026-11-24')

        expect(res.body.habits[0].doneInPeriod).toBe(true)
    })

    it('unmarks a habit', async () => {
        const created = await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'daily' })
            .expect(201)
        const id = created.body.habit.id

        await agent
            .put(`/api/habits/${id}/logs/2026-11-24`)
            .expect(204)
        // obriši oznaku
        await agent
            .delete(`/api/habits/${id}/logs/2026-11-24`)
            .expect(204) 

        // popis za taj dan - navika ne smije biti označena
        const res = await agent.get('/api/habits?today=2026-11-24')

        expect(res.body.habits[0].doneInPeriod).toBe(false)
    })

    it('archives a habit', async () => {
        const created = await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'daily'})
            .expect(201)
        const id = created.body.habit.id

        // arhiviraj naviku s tim id-om
        await agent
            .delete(`/api/habits/${id}`)
            .expect(204)

        // popis mora biti prazan
        const res = await agent.get('/api/habits?today=2026-11-24')
        expect(res.body.habits).toHaveLength(0)
    })

    it('does not let another user mark my habit', async () => {
        const created = await agent
            .post('/api/habits')
            .send({ name: 'Read', frequency: 'daily'})
            .expect(201)
        const id = created.body.habit.id 

        await request(app)
            .post('/api/auth/register')
            .send({ email: 'other@example.com', password: '123456789', nickname: 'other' })
            .expect(201)
        
        const otherAgent = request.agent(app) // drugi korisnik dobije svoj "preglednik" i prijavi se u njemu

        await otherAgent
            .post('/api/auth/login')
            .send({ email: 'other@example.com', password: '123456789'})
            .expect(200)

        // Drugi korisnik pokušava označit moju naviku - mora dobiti 404
        const res = await otherAgent.put(`/api/habits/${id}/logs/2026-11-24`)
        expect(res.status).toBe(404)
        expect(res.body.message).toBe('Habit not found')
    })
})