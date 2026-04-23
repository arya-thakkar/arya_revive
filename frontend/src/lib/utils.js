export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function getDaysSince(date) {
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 21) return 'evening'
  return 'night'
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
