const users = [];

//addUser

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required.'
    };
  }

  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: 'Username already taken!'
    };
  }

  const user = { id, username, room };

  users.push(user);
  return { user };
};

//removeUser
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};
//getUser
const getUser = id => {
  const user = users.find(element => element.id === id);

  if (!user) {
    return undefined;
  }

  return user;
};
//getUsersInRoom
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
