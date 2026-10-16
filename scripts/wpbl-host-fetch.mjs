// Retry reads only; never substitute an old checkout for the live baseline.
export async function fetchHostJson(url, label, {
  allowMissing = false,
  fetchImpl = fetch,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    let retryable = false
    try {
      let response
      try {
        response = await fetchImpl(url, {
          headers: { accept: 'application/json' }, cache: 'no-store',
          signal: AbortSignal.timeout(20000), redirect: 'error',
        })
      } catch (error) {
        retryable = true
        throw new Error(`${error.message}${error.cause?.code ? ` (${error.cause.code})` : ''}`)
      }
      if (allowMissing && response.status === 404) return null
      if (!response.ok) {
        // Hostinger has intermittently denied these public reads. A persistent
        // denial still fails closed after three attempts.
        retryable = [403, 408, 429, 500, 502, 503, 504].includes(response.status)
        await response.body?.cancel()
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      if (!retryable || attempt === 3) {
        throw new Error(`${label} (${url}) failed after ${attempt} attempt(s): ${error.message}`, { cause: error })
      }
      await sleep(attempt * 1000)
    }
  }
}
