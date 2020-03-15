const socket = io();

const $messageFrom = document.querySelector('#message-form');
const $messageFromInput = $messageFrom.querySelector('input');
const $messageFromButton = $messageFrom.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//templates
const messageTemplates = document.querySelector('#message-template').innerHTML;
const locationTemplates = document.querySelector('#location-template')
  .innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  //new message
  const $newMessage = $messages.lastElementChild;
  //height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height
  const visibleHeight = $messages.offsetHeight;

  //height of message container
  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = containerHeight;
  }
};

socket.on('message', msg => {
  const html = Mustache.render(messageTemplates, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('hh:mm a')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', msg => {
  const html = Mustache.render(locationTemplates, {
    username: msg.username,
    message: msg.url,
    createdAt: moment(msg.createdAt).format('hh:mm a')
  });

  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room: room,
    users: users
  });

  document.querySelector('#sidebar').innerHTML = html;
});

$messageFrom.addEventListener('submit', e => {
  e.preventDefault();

  $messageFromButton.setAttribute('disabled', 'disabled');

  const msg = e.target.elements.message.value;

  socket.emit('sendMessage', msg, deliveryMessage => {
    $messageFromButton.removeAttribute('disabled');
    $messageFromInput.value = '';
    $messageFromInput.focus();
  });
});

$locationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.');
  }

  $locationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      position.coords.latitude,
      position.coords.longitude,
      () => {
        $locationButton.removeAttribute('disabled');
        console.log('Location shared');
      }
    );
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
