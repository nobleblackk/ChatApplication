// Here we will keep track of all the users
const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room: room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //   Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }
  //   Check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use",
    };
  }

  //   Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => {
    return user.id === id;
  });
};

const getUserInRoom = (room) => {
  return users.filter((user) => {
    return user.room === room;
  });
};

// const { user } = addUser({
//   id: 22,
//   username: "AbHishek",
//   room: "     South",
// });

// console.log("New User", user);

// const user = getUser(22);
// console.log(user);

// const userList = getUserInRoom("south");
// console.log(userList);

// // console.log(users);

// // const removedUser = removeUser(22);

// // console.log(removedUser);

// // console.log(users);

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
};
