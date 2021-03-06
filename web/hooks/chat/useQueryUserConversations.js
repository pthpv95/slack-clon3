import { useQuery } from "react-query";  
import { fetchWrapper } from "../fetchWrapper";

const useQueryUserConversations = () => {
  return useQuery('user_conversations', () => fetchWrapper('/conversations', 'GET'))
}

export default useQueryUserConversations