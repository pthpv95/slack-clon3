import React from 'react';

// eslint-disable-next-line react/display-name
const Input = React.forwardRef((props, ref) => (
  <input
    className="input-chat"
    type="text"
    placeholder="Jot something down"
    ref={ref}
    {...props}
  />
));

export default Input;
