const shortDateFormatter = new Intl.DateTimeFormat('en-CA', {
  month: 'short',
  day: 'numeric',
})

export function formatShortDate(dateString) {
  if (!dateString) {
    return 'No activity yet'
  }

  return shortDateFormatter.format(new Date(dateString))
}

export function formatRelativeActivity(dateString) {
  if (!dateString) {
    return 'New deck'
  }

  const elapsed = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(elapsed / 3_600_000)
  const days = Math.floor(elapsed / 86_400_000)

  if (hours < 1) {
    return 'Updated just now'
  }

  if (hours < 24) {
    return `Updated ${hours}h ago`
  }

  if (days < 7) {
    return `Updated ${days}d ago`
  }

  return `Updated ${formatShortDate(dateString)}`
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}
