// tells server that connection is eastablished. :)
const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;

const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options, this returns us an object which have key: value properties, that we submitted in the form
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  // it will return the last message that added recently to the bottom
  const $newMessage = $messages.lastElementChild;

  // getComputedStyles is a global function, which returns the given styles applied to argument element, returns an object containing all the style properties applied to that element.
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);

  console.log(newMessageMargin);

  console.log(newMessageStyles);

  // Height of the last/new message
  // offsetHeight gives us the total height, the element will take, but it doesn't take care of margin
  // const newMessageHeight = $newMessage.offsetHeight;

  // Now as we do have margin for bottom, so lets add up all those
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height => The amount of view we can see is known as visible height. Using offsetHeight on our $messages will give us the total visible height.
  const visibleHeight = $messages.offsetHeight;

  // Height of messages contatiner. it might be very large as compared to the visible height, as there are continuous message coming. scrollHeight gonna provide us the total container height.
  const containerHeight = $messages.scrollHeight;

  // Now we have to figure out that how far down/up we have  scrolled
  // scrollTop gonna provide us the distance from the top of the container to the the depth upto which we have scrolled till so far, so we are adding in that our visible height in order to calculate.
  const scrolledOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrolledOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

// Registering Event for welcome and general messages.
socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

// Registering Event for only Location Sending.
socket.on("sendLocation", (message) => {
  // console.log(url);
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  // It prevent to reload the page after submitting, which is default behaviour.
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    // console.log("The message was " + message);
    if (error) {
      return console.log(error);
    }
    console.log("Message delivered");
  });
});

socket.on("roomData", ({ room, users }) => {
  // console.log(room);
  // console.log(users);
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

// Using Browser Geo Location API to fetch the user's location
$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  console.log("Location disabled");
  $sendLocationButton.setAttribute("disabled", "disabled");

  //   It is a asynchronous api call, but it doesn't support promises and async await, so we can't use them directly, instead we are attaching a callback function in order to fetch the location co-ordinates.
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      (error) => {
        if (error) {
          return console.log(error);
        }
        // Location Button Enabled again.
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location Shared!");
      }
    );
    // $sendLocationButton.removeAttribute("disabled");
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

// socket.on("countUpdated", (count) => {
//   console.log("The Count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   //   console.log("Clicked");
//   socket.emit("increment");
// });
