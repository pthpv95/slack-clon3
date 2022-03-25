import { Button, Modal, Textarea, useModal } from '@nextui-org/react';
import Image from 'next/image';
import React, { useState } from 'react';

const DirectMessage = ({ conversations, onClick }) => {
  const [showRemoveBtn, setShowRemoveBtn] = useState(null);
  const [selectedContact, setSelectedContact] = useState();
  const { visible, setVisible } = useModal()
  const closeHandler = () => setVisible(false)

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
      <div className="sidebar-content__direct-message--add-teammate" onClick={() => setVisible(true)}>
        <Image src={'/assets/icons/plus.svg'} alt="plus" width={25} height={25} />
        <p>
          Add teammates
        </p>
      </div>
      <Modal
        closeButton
        aria-labelledby="add teammate"
        open={visible}
        onClose={closeHandler}
        className='custom-modal'
      >
        <Modal.Header css={{ fontSize: '1.5rem' }}>
          Invite people to your work space
        </Modal.Header>
        <Modal.Body>
          <Textarea
            bordered
            fullWidth
            color="primary"
            size="lg"
            placeholder="Email"
            autoFocus
          />
        </Modal.Body>
        <Modal.Footer>
          <Button auto onClick={closeHandler}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </div >
  );
};

export default DirectMessage;