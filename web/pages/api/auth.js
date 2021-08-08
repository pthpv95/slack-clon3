const login = (username, password) => {
  return fetch(process.env.NEXT_PUBLIC_BE_HOST_API + '/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
    mode: 'cors',
  })
    .then((res) => {
      if (res.ok) {
        return res.json()
      }
    })
    .catch((err) => {
      throw err
    })
}

export { login }
