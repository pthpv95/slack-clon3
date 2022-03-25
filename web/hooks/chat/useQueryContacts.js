import { useQuery } from "react-query";
import { fetchWrapper } from "../fetchWrapper";

const useQueryContacts = () => {
  return useQuery('user_contacts', () => fetchWrapper('/users/contacts', 'GET'))
}

export default useQueryContacts