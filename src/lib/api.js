async function parseResponse(response) {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.error || 'Request failed.'
    throw new Error(message)
  }

  return payload
}

export async function apiGet(path) {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
    },
  })

  return parseResponse(response)
}

export async function apiSend(path, method, body) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  return parseResponse(response)
}
