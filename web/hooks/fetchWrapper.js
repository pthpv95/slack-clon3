const fetchWrapper = async (url, method, body = null) => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(
      process.env.NEXT_PUBLIC_BE_HOST_API + `/api${url}`,
      {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
      }
    )
    if (res.ok) {
      return res.json()
    }
    throw res
  } catch (err) {
    if (err.status === 401) {
      window.location.href = '/login'
      return
    }
    throw err
  }
}

export { fetchWrapper }
