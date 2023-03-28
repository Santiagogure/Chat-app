const socket = io();

let fileURL;
let currentUser;

const formLogin = document.querySelector("#formLogin");
const formContentChat = document.querySelector(".body-chat");
const formShowUsers = document.querySelector("#formShowUsers");
const formChatGrupal = document.querySelector("#formChatGrupal");

const txtUserNickName = document.querySelector("#userNickName");
const txtUserMessage = document.querySelector("#userMessage");

const userFile = document.querySelector("#userFile");

const btnrRegisterUser = document.querySelector("#registerUser");
const btnSendMessage = document.querySelector("#sendMessage");
const btnSendFile = document.querySelector("#sendFile");

const printUsersActive = document.querySelector("#usersActive");
const printMessages = document.querySelector("#messages");

formContentChat.style.display = "none";
formShowUsers.style.display = "none";
formChatGrupal.style.display = "none";

// Escuchamos el evento "login" del servidor y mostramos una alerta de bienvenida al usuario
socket.on("login", () => {
  alert("Welcome " + txtUserNickName.value.trim());
  formLogin.style.display = "none";
  formContentChat.style.display = "flex";
  formShowUsers.style.display = "block";
  formChatGrupal.style.display = "block";
  currentUser = txtUserNickName.value.trim();
});

// Escuchamos el evento "userExists" del servidor y mostramos una alerta indicando que el username ya está en uso
socket.on("userExists", () => {
  alert("The username " + txtUserNickName.value.trim() + "already exist");
  txtUserNickName.value = "";
});

// Escuchamos el evento "activeSessions" del servidor y actualizamos la lista de usuarios activos
socket.on("activeSessions", (users) => {
  printUsersActive.innerHTML = "";
  for (const user in users) {
    printUsersActive.insertAdjacentHTML("beforeend", `<li>${user}</li>`);
  }
});

// Escuchamos el evento "sendMessage" del servidor y mostramos el mensaje enviado por el usuario
socket.on("sendMessage", ({ message, user, image }) => {
  let messageClass = "frnd_message";
  if (user === currentUser) {
    messageClass = "my_message";
  }

  printMessages.insertAdjacentHTML(
    "beforeend",
    `<div class="message ${messageClass}"><p>${message}<br /><span>${user}</span></p></div>`
  );
  if (image !== undefined) {
    const imagen = document.createElement("img");
    imagen.src = image;
    printMessages.appendChild(imagen);
  }
  printMessages.scrollTop = printMessages.scrollHeight;
});

txtUserNickName.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    btnrRegisterUser.click();
  }
});

btnrRegisterUser.addEventListener("click", () => {
  if (txtUserNickName.value.trim() != "") {
    let username = txtUserNickName.value.trim();
    socket.emit("register", username);
  }
});

btnSendMessage.addEventListener("click", () => {
  if (fileURL != undefined) {
    socket.emit("sendMessage", {
      message: txtUserMessage.value.trim(),
      image: fileURL,
    });
  } else {
    if (txtUserMessage.value.trim() != "") {
      socket.emit("sendMessage", {
        message: txtUserMessage.value.trim(),
        image: fileURL,
      });
    }
  }

  txtUserMessage.value = "";
  fileURL = undefined;
  printMessages.scrollTop = printMessages.scrollHeight;
});

txtUserMessage.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    if (fileURL != undefined) {
      socket.emit("sendMessage", {
        message: txtUserMessage.value.trim(),
        image: fileURL,
      });
    } else {
      if (txtUserMessage.value.trim() != "") {
        socket.emit("sendMessage", {
          message: txtUserMessage.value.trim(),
          image: fileURL,
        });
      }
    }
    txtUserMessage.value = "";
    fileURL = undefined;
  }

  printMessages.scrollTop = printMessages.scrollHeight;
});

btnSendFile.addEventListener("click", () => {
  userFile.click();
});

userFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    fileURL = reader.result;
  };
  reader.readAsDataURL(file);
  fileURL ? alert("Error") : alert("The photo is ready");
});
