import { describe, it, expect } from 'vitest'
import { calculateStreak } from '../utils/streak.js'

describe ('calculateStreak', () => {

    // nikad označena - nema niza
    it('returns 0 when the habit was never done', () => {
        expect(calculateStreak([], 'daily', '2026-11-24')).toBe(0)
    })

    // tri dana za redom i danas 
    it('counts 3 days in a row', () => { 
        expect(calculateStreak(['2026-11-22', '2026-11-23', '2026-11-24'], 'daily', '2026-11-24')).toBe(3)
    })

    // danas još nije označena
    it('keeps the streak when today is not marked yet', () => { 
        expect(calculateStreak(['2026-11-22', '2026-11-23'], 'daily', '2026-11-24')).toBe(2) // streak očekuje 2 jer danas još traje, niz nije prekinut
    })

    // rupa prekida niz
    it('resets after a missed day', () => { 
        expect(calculateStreak(['2026-11-20', '2026-11-23', '2026-11-24'], 'daily', '2026-11-24')).toBe(2) 
    })

    // dva dana istog tjedna
    it('counts two days of the same week once', () => { 
        expect(calculateStreak(['2026-11-23', '2026-11-24'], 'weekly', '2026-11-24')).toBe(1) // tjedan se broji jednom
    })
})