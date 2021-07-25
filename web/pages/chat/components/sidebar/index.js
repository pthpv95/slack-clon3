import React from 'react';
import Channels from './channels';
import DirectMessage from './direct-message';

const SideBar = ({ conversations, onDirectMessageClick }) => {
  return (
    <div className="sidebar-content">
      <Channels />
      <DirectMessage conversations={conversations} onClick={onDirectMessageClick} />
    </div>
  );
};

export default SideBar;
