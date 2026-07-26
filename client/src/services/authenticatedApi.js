/**
 * Use this helper for future endpoints that require a Clerk session. It never
 * stores tokens: Clerk provides a short-lived token for each request.
 */
export async function authenticatedFetch(getToken, path, options = {}) {
  const token = await getToken()
  const headers = new Headers(options.headers)

  if (token) headers.set('Authorization', `Bearer ${token}`)

  return fetch(path, { ...options, headers })
}
