// Pomoćne funkcije za kalendar na Dashboardu. Datumi su uvijek tekst 'YYYY-MM-DD', kao na backendu.
// Računamo u UTC-u, da vremenska zona preglednika ne pomakne datum za jedan dan.

// 'YYYY-MM-DD' -> Date objekt (ponoć u UTC-u)
function toDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day))
}

// Date objekt -> 'YYYY-MM-DD'
function toDateStr(date) {
    return date.toISOString().slice(0, 10)
}

// Dio datuma kao tekst na engleskom: part('2026-10-27', { weekday: 'long' }) -> 'Tuesday'
// (en-US jer en-GB rujan skraćuje u 'Sept', a u dizajnu su sva imena mjeseci od 3 slova)
function part(dateStr, options) {
    return toDate(dateStr).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' })
}

// Datum pomaknut za n dana: addDays('2026-10-31', 1) -> '2026-11-01', addDays('2026-10-01', -1) -> '2026-09-30'
export function addDays(dateStr, n) {
    const date = toDate(dateStr)
    date.setUTCDate(date.getUTCDate() + n)
    return toDateStr(date)
}

// Prvi dan mjeseca pomaknutog za n mjeseci: addMonths('2026-10-27', -1) -> '2026-09-01'
export function addMonths(dateStr, n) {
    const date = toDate(periodStart(dateStr, 'monthly'))
    date.setUTCMonth(date.getUTCMonth() + n)
    return toDateStr(date)
}

// Početak perioda kojem datum pripada (ista pravila kao periodStart na backendu):
//   daily   -> taj isti dan             ('2026-10-22' -> '2026-10-22')
//   weekly  -> ponedjeljak tog tjedna   ('2026-10-22' -> '2026-10-19')
//   monthly -> prvi dan u mjesecu       ('2026-10-22' -> '2026-10-01')
export function periodStart(dateStr, frequency) {
    const date = toDate(dateStr)
    if (frequency === 'weekly') {
        const daysSinceMonday = (date.getUTCDay() + 6) % 7 // getUTCDay: nedjelja = 0, ponedjeljak = 1...
        date.setUTCDate(date.getUTCDate() - daysSinceMonday)
    } else if (frequency === 'monthly') {
        date.setUTCDate(1)
    }
    return toDateStr(date)
}

// Prvi datum koji mreža kalendara prikazuje: ponedjeljak tjedna u kojem je 1. u mjesecu
// Primjer: gridStart('2026-10-01') -> '2026-09-28'
export function gridStart(month) {
    return periodStart(periodStart(month, 'monthly'), 'weekly')
}

// Mreža kalendara za mjesec (bilo koji datum u njemu): tjedni od ponedjeljka do nedjelje.
// Vraća niz tjedana, a svaki tjedan je niz od 7 dana:
//   { date: '2026-09-28', day: 28, inMonth: false, isToday: false, isFuture: false }
// inMonth = false za dane susjednih mjeseci (prikazuju se sivo), isFuture = dan još nije došao.
// Primjer: monthGrid('2026-10-01', '2026-10-27') -> 5 tjedana, od pon 28. 9. do ned 1. 11.
export function monthGrid(month, today) {
    const monthPrefix = month.slice(0, 7) // '2026-10'
    let date = gridStart(month)
    const weeks = []

    // dodajemo tjedne dok ponedjeljak sljedećeg tjedna još pripada ovom mjesecu
    do {
        const week = []
        for (let i = 0; i < 7; i++) {
            week.push({
                date,
                day: Number(date.slice(8)),
                inMonth: date.slice(0, 7) === monthPrefix,
                isToday: date === today,
                isFuture: date > today, // datumi kao tekst se mogu uspoređivati
            })
            date = addDays(date, 1)
        }
        weeks.push(week)
    } while (date.slice(0, 7) === monthPrefix)

    return weeks
}

// Periodi za red tjedne ili mjesečne navike. Svaki period je jedan kvadratić:
//   { start: početak perioda, label: tekst iznad kvadratića, isCurrent: period u kojem je danas, isFuture: još nije došao }

// Tjedni mjeseca, numerirani od 1 (isti tjedni kao u monthGrid).
// Vraća: [{ start: '2026-09-28', label: '1', isCurrent: false, isFuture: false }, ...]
export function monthWeeks(month, today) {
    const currentWeek = periodStart(today, 'weekly')
    return monthGrid(month, today).map((week, i) => ({
        start: week[0].date, // ponedjeljak tog tjedna
        label: String(i + 1),
        isCurrent: week[0].date === currentWeek,
        isFuture: week[0].date > currentWeek,
    }))
}

// Jedan mjesec, kao niz s jednim periodom (isti oblik kao monthWeeks).
// Vraća: [{ start: '2026-10-01', label: 'Oct', isCurrent: true, isFuture: false }]
export function monthPeriod(month, today) {
    const start = periodStart(month, 'monthly')
    const currentMonth = periodStart(today, 'monthly')
    return [{
        start,
        label: monthName(month, 'short'),
        isCurrent: start === currentMonth,
        isFuture: start > currentMonth,
    }]
}

// Zadnjih 5 perioda za mobilni prikaz, od najstarijeg do tekućeg.
// Vraća: [{ start: '2026-10-23', top: 'FRI', main: '23', label: 'Friday 23 October', isCurrent: false }, ...]
// top i main su tekst iznad stupca, a label je ime stupca za čitače ekrana.
export function recentPeriods(frequency, today) {
    const current = periodStart(today, frequency)
    const periods = []

    for (let i = 4; i >= 0; i--) {
        const isCurrent = i === 0
        if (frequency === 'daily') {
            const start = addDays(current, -i)
            periods.push({
                start,
                top: part(start, { weekday: 'short' }).toUpperCase(),
                main: String(Number(start.slice(8))),
                label: isCurrent ? 'today' : `${part(start, { weekday: 'long' })} ${longDay(start)}`,
                isCurrent,
            })
        } else if (frequency === 'weekly') {
            const start = addDays(current, -7 * i)
            periods.push({
                start,
                top: part(start, { month: 'short' }).toUpperCase(),
                main: String(Number(start.slice(8))),
                label: isCurrent ? 'this week' : `week of ${longDay(start)}`,
                isCurrent,
            })
        } else {
            const start = addMonths(current, -i)
            periods.push({
                start,
                top: '',
                main: part(start, { month: 'short' }),
                label: isCurrent ? 'this month' : part(start, { month: 'long' }),
                isCurrent,
            })
        }
    }

    return periods
}

// Svi datumi od from do to, uključujući oba: dateRange('2026-10-29', '2026-10-31') -> ['2026-10-29', '2026-10-30', '2026-10-31']
export function dateRange(from, to) {
    const dates = []
    for (let date = from; date <= to; date = addDays(date, 1)) {
        dates.push(date)
    }
    return dates
}

// Dan i puno ime mjeseca: longDay('2026-09-28') -> '28 September'
function longDay(dateStr) {
    return `${Number(dateStr.slice(8))} ${part(dateStr, { month: 'long' })}`
}

// Kratki datum na engleskom: dayLabel('2026-10-01') -> '1 Oct'
export function dayLabel(dateStr) {
    return `${Number(dateStr.slice(8))} ${part(dateStr, { month: 'short' })}`
}

// Današnji datum iznad naslova: longDate('2026-10-27') -> 'Tuesday, 27 October'
export function longDate(dateStr) {
    return `${part(dateStr, { weekday: 'long' })}, ${longDay(dateStr)}`
}

// Ime mjeseca na engleskom: monthName('2026-10-27') -> 'October 2026', monthName('2026-10-27', 'short') -> 'Oct',
// monthName('2026-10-27', 'plain') -> 'October'
export function monthName(today, format = 'long') {
    if (format === 'short') return part(today, { month: 'short' })
    if (format === 'plain') return part(today, { month: 'long' })
    return part(today, { month: 'long', year: 'numeric' })
}
