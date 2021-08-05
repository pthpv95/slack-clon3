import React from 'react';

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
