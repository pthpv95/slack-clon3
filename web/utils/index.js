const generateUniqueId = () => {
  return Math.random().toString(36).substr(2, 10)
}

const isServer = typeof window === 'undefined'

const getUserId = () => {
  if (isServer) {
    return null
  }

  const token = sessionStorage.getItem('token')
}

const isAuthenticated = () => {
  if (isServer) {
    return
  }

  const token = sessionStorage.getItem('token')
  fetch(BE_URL + 'users/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      return res.json()
    })
    .catch((err) => {
      // window.location.href = '/login'
    })
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

const isMobile = () => {
  if (!isServer && navigator) {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  return false
}

export {
  generateUniqueId,
  isServer,
  getUserId,
  isAuthenticated,
  delay,
  isMobile,
}
