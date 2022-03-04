import React, { useRef } from 'react'
import useOnClickOutside from '../../hooks/shared/useClickOutside'

const Popup = ({ open, onClose, children, className, size = 'sm', closeOutFocus = false }) => {
  const ref = useRef()
  useOnClickOutside(ref, () => {
    onClose()
  })

  return (
    <div className='popup'>
      <div className={`popup__inner popup__inner--size-${size} ${className ?? ''}`} ref={ref}>
        <div className="popup__inner--close-btn">
          <button onClick={onClose}>X</button>
        </div>
        <div className="popup__inner--main">
          {children}
        </div>
      </div>
    </div>
  );
}
export default Popup