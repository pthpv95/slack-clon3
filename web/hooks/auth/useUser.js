import { useQuery } from 'react-query'
import { fetchWrapper } from '../fetchWrapper'

const useUser = () => {
  const fetchUser = async () => {
    try {
      const user = await fetchWrapper('/users/me', 'GET')
      return {
        ...user,
        displayName: user.firstName + ' ' + user.lastName,
      }
    } catch (e) {
      throw e
    }
  }

  return useQuery('user_info', () => fetchUser(), {
    cacheTime: Infinity,
  })
}

export default useUser
