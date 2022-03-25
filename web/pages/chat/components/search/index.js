import { Avatar, Button } from '@nextui-org/react'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'
import useUser from '../../../../hooks/auth/useUser'
import useQueryContacts from '../../../../hooks/chat/useQueryContacts'
import useOnClickOutside from '../../../../hooks/shared/useClickOutside'

const Search = ({ thread, onSubmit, onMoreAction, onCloseThread }) => {
  const { isLoading, data, isError } = useUser()
  const ref = useRef()
  const [isModalOpen, setModalOpen] = useState(false)
  useOnClickOutside(ref, () => setModalOpen(false))

  const { data: contacts } = useQueryContacts()
  const [searchResult, setSearchResult] = useState(contacts)

  const router = useRouter()

  if (isError) {
    router.push('/login')
  }
  if (isLoading) {
    return 'Loading...'
  }

  if (!data) {
    return null
  }
  console.log('contacts', contacts);
  const handleChange = (e) => {
    let searchTerm = e.target.value.toLowerCase();
    const searchContacts = contacts.filter(c => c.firstName.toLowerCase().includes(searchTerm) || c.lastName.toLowerCase().includes(searchTerm))
    console.log('searchContacts', searchContacts);
  }

  return (
    <>
      <div className="search__box">
        <input
          className="search__box--input"
          placeholder="Search anything ... "
          onChange={handleChange}
        />
      </div>
      <div className="search__user-info">
        <Avatar squared src={data.avatarUrl} onClick={() => setModalOpen(true)} />
        {isModalOpen && (
          <div className="search__user-info--toggle-data" ref={ref}>
            <Button
              auto
              color='gradient'
              onClick={() => {
                localStorage.clear()
                router.push('/login')
              }}
            >
              Sign out
            </Button>
          </div>
        )}
      </div>
    </>
  )
}

export default Search
