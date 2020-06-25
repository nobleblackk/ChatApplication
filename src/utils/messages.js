const generateMessage = (username = "Admin", text) => {
  return {
    username,
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocation = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocation,
};
