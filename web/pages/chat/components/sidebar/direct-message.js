import React, { useState } from 'react';
import Image from 'next/image'
import Popup from '../../../../shared/components/Popup';

const DirectMessage = ({ conversations, onClick }) => {
  const [showRemoveBtn, setShowRemoveBtn] = useState(null);
  const [selectedContact, setSelectedContact] = useState();
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="sidebar-content__direct-message">
      <p className="sidebar-content__direct-message--title">Direct messages</p>
      {conversations && conversations.map((u, idx) => {
        return (
          <div key={u.title} className={`sidebar-content__direct-message--user ${selectedContact === u.id ? 'active-contact' : ''}`}
            onMouseEnter={() => {
              setShowRemoveBtn(u.id)
            }}
            onMouseLeave={() => {
              setShowRemoveBtn(null)
            }}
            onClick={() => {
              setSelectedContact(u.id)
              onClick(u)
            }}
          >
            <Image src={u.avatar} alt={u.name} width={30} height={30} />
            <p>{u.title}</p>
            {showRemoveBtn === u.id &&
              <div className="remove-teammates">
                <Image src={'/assets/icons/x.svg'} alt={u.name} width={30} height={30} />
              </div>
            }
          </div>)
      })}
      <div className="sidebar-content__direct-message--add-teammate" onClick={() => {
        setIsOpen(true)
      }}>
        <Image src={'/assets/icons/plus.svg'} alt="plus" width={25} height={25} />
        <p>
          Add teammates
        </p>
      </div>
      <Popup
        className="custom-popup"
        open={isOpen}
        size='sm'
        onClose={() => {
          setIsOpen(false)
        }}>
        <p>Are you sure</p>
      </Popup>
    </div>
  );
};

export default DirectMessage;