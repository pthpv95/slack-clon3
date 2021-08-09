import React, { useState } from 'react'
import useLogin from '../../hooks/auth/useLogin'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { isLoading, mutate } = useLogin(username, password)
  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          mutate()
        }}
      >
        <input
          type="text"
          placeholder="User name"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          Login
        </button>
      </form>
    </div>
  )
}

export default Login
