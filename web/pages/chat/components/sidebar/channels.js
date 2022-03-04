import React from 'react';
import Image from 'next/image'
import Popup from '../../../../shared/components/Popup';
import useModal from '../../../../hooks/shared/useModal';

const Channels = ({ channelss }) => {
  const { isOpen, onModalClose, onModalOpen } = useModal()

  const channels = [
    {
      "id": "9",
      "name": "Boyer, Wisozk and Brakus"
    },
    {
      "id": "x",
      "name": "Thompson, Hagenes and Jacobson"
    },
    {
      "id": "o",
      "name": "Ferry, Swaniawski and Conroy"
    },
    {
      "id": "0",
      "name": "Blick - Wolff"
    },
    {
      "id": "s",
      "name": "Volkman - Ankunding"
    },
    {
      "id": "m",
      "name": "Zulauf - Wolf"
    }
  ]

  return (
    <div className="sidebar-content__channel">
      <p className="sidebar-content__channel--title">Channels</p>
      {channels && channels.map(u => {
        return <div className="sidebar-content__channel--item" key={u.id}>
          <p>#</p>
          <p>{u.name}</p>
        </div>
      })}
      <div className="sidebar-content__channel--add" onClick={onModalOpen}>
        <Image src={'/assets/icons/plus.svg'} alt="plus" width={25} height={25} />
        <p>
          Add channel
        </p>
      </div>
      {isOpen &&
        <Popup
          className="custom-popup"
          open
          size='xs'
          onClose={onModalClose}>
          <div className="create-channel">
            <h3>Create channel</h3>
            <form>
              <div className="create-channel__text-box">
                <label>Name</label>
                <input type='text' maxLength="80" required placeholder="e.g plan something" />
              </div>
              <div className="create-channel__text-box">
                <label>Description</label>
                <input type='text' placeholder="" />
              </div>
              <div className="create-channel__submit-btn">
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </Popup>
      }
    </div>
  );
};

export default Channels;