import React, { useEffect, useState } from 'react'

const Popup = ({ open, onClose, children, className, size }) => {
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleClose = () => {
    if (onClose) {
      onClose();
      return
    }
    setIsOpen(false)
  }

  return (
    isOpen &&
    <div className='popup'>
      <div className={`popup__inner popup__inner--size-${size} ${className ?? ''}`}>
        <div className="popup__inner--close-btn">
          <button onClick={handleClose}>X</button>
        </div>
        <div className="popup__inner--main">
          {children}
        </div>
      </div>
    </div>
  );
}
export default Popup