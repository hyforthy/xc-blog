export async function verifyToken(): Promise<boolean> {
  try {
    const response = await fetch('/admin/api/auth/verify', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 401) {
      return false
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const { authenticated } = await response.json()
    return authenticated === true

  } catch (error) {
    console.error('Token verification failed:', error)
    return false
  }
}