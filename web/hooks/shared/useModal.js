import { useState } from "react"

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  const onModalClose = () => setIsOpen(false)
  const onModalOpen = () => setIsOpen(true)

  return {
    isOpen,
    onModalClose,
    onModalOpen
  }
}

export default useModal