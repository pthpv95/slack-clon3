
const EventEmitter = require('events');
const ee = new EventEmitter();
ee.setMaxListeners(30);
const events = {
  ON_ADD_USER_TO_CONVERSATION: 'ON_ADD_USER_TO_CONVERSATION',
};

const publish = (eventName, payload) => {
  const rs = ee.emit(eventName, payload);
  if (rs) {
    console.log(`${eventName} published successfully`);
  } else {
    console.log(`${eventName} published fail`);
  }
};

const register = (eventName, handler) => {
  ee.addListener(eventName, (payload) => handler(payload));
  console.log(`subscribed on ${eventName}`);
};

export {
  events,
  publish,
  register,
};