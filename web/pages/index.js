/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { QueryClient } from 'react-query'
import { fetchWrapper } from '../hooks/fetchWrapper'

const queryClient = new QueryClient()
export default function Layout() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    fetchWrapper('/users/me', 'GET').then((user) => {
      setIsLoading(false)
      if (!user) {
        router.push('/login')
      } else {
        const redirectTo = router.asPath === '/' ? '/chat' : router.asPath
        router.push(redirectTo)
      }
    })
  }, [])

  return <div>{isLoading ? 'Loading ...' : ''}</div>
}
