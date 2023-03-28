const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const PORT = 8000;

// Creamos un objeto para almacenar los usuarios conectados
const list_users = {};

// Indicamos la carpeta en la que se encuentran los archivos estáticos
app.use(express.static(path.join(__dirname, "src")));

// Iniciamos el servidor
server.listen(PORT, () => {
  console.log(`Servidor inicializado en localhost:${PORT}`);
});

// Definimos lo que sucede cuando un usuario se conecta
io.on("connection", (socket) => {
  socket.on("register", (nickname) => {
    // Verificamos si el nombre de usuario ya existe
    if (list_users[nickname]) {
      socket.emit("userExists");
      return;
    } else {
      // Si el nombre de usuario no existe lo añadimos a la lista de usuarios conectados
      list_users[nickname] = socket.id;
      socket.nickname = nickname;
      socket.emit("login");
      io.emit("activeSessions", list_users);
    }
  });

  // Definimos lo que sucede cuando un usuario se desconecta
  socket.on("disconnect", () => {
    // Eliminamos al usuario de la lista de usuarios conectados
    delete list_users[socket.nickname];
    io.emit("activeSessions", list_users);
  });

  // Definimos lo que sucede cuando un usuario envía un mensaje
  socket.on("sendMessage", ({ message, image }) => {
    io.emit("sendMessage", { message, user: socket.nickname, image });
  });
});
