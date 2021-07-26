const { io } = require("socket.io-client");
const fetch = require('node-fetch');
const BE_HOST = 'http://localhost:3001';
const prompt = require('prompt');

const startPrompt = () => {
  prompt.start();
  const properties = [
    {
      name: 'username',
      validator: /^[a-zA-Z\s\-]+$/,
      warning: 'Username must be only letters, spaces, or dashes'
    },
    {
      name: 'password',
      hidden: true
    }
  ];
  prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Password: ' + result.password);
  });
}

(async () => {
  const socket = io(BE_HOST, {
    withCredentials: true
  });
  socket.on('connect', async () => {
    console.log('connected to server');

    const { token } = await fetch(BE_HOST + '/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "username": "tuanpham@gmail.com",
        "password": "123456"
      })
    }).then((res) => res.json());
    const rooms = await fetch(BE_HOST + '/api/messages/conversations', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json())
    rooms.forEach((room) => {
      socket.emit('join_room', { roomId: room._id })
    })
  })

  socket.on('disconnect', () => {
    console.log('disconnected to server');
  })

  socket.on('new_message', (data) => {
    console.log(data);
    // startPrompt();
  });
})()