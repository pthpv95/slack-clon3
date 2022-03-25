import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { fetchWrapper } from '../hooks/fetchWrapper'
import { Loading } from '@nextui-org/react';

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
  }, [router])

  return isLoading && <Loading />
}
