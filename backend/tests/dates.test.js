import { describe, it, expect } from 'vitest'
import { addDays, periodStart, previousPeriod } from '../utils/dates.js'

describe('addDays', () => { 
    // prelazak u novi mjesec
    it('moves into the next month', () => {
        expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    })

    it('goes back 29 days', () => {
        expect(addDays('2026-10-30', -29)).toBe('2026-10-01') // negativan broj ide unatrag
    }) 
})

describe('periodStart', () => {
    // tjedni period počinje u ponedjeljak
    it('returns the Monday of the week', () => {
        expect(periodStart('2026-10-22', 'weekly')).toBe('2026-10-19') 
    })

    // nedjelja je u JS-u dan 0, pa se tu lako pogriješi
    it('puts Sunday in the same week as the Monday before', () => {
        expect(periodStart('2026-10-25', 'weekly')).toBe('2026-10-19')
    })

    it('returns the first day of the month', () => {
        expect(periodStart('2026-10-22', 'monthly')).toBe('2026-10-01')
    })
}) 

describe('previousPeriod', () => {
    it('returns the first day of the previous month', () => { 
        expect(previousPeriod('2026-03-01', 'monthly')).toBe('2026-02-01')
    })
})