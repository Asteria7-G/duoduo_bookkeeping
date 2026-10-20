function pad(value) { return String(value).padStart(2, '0') }

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function monthKey(date) { return formatDate(date).slice(0, 7) }
function yearKey(date) { return formatDate(date).slice(0, 4) }

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function weekday(dateString) {
  return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][new Date(`${dateString}T00:00:00`).getDay()]
}

function startOfWeek(date) {
  const d = new Date(date)
  const diff = d.getDay() === 0 ? -6 : 1 - d.getDay()
  return addDays(d, diff)
}

module.exports = { pad, formatDate, monthKey, yearKey, addDays, weekday, startOfWeek }
