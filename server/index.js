const express = require('express');
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');
const cors = require('cors');
const startJobs = require('./handlers/startHandler');
const apiRouter = require('./api/api');
const jsonServer = require('json-server');
const jsonserver = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const crypto = require("crypto");

const update = require('./websockets/updateQueue')
const uuid = require('./uuid');

require('dotenv/config')

const randomId = () => { return crypto.randomBytes(8).toString("hex") };

const { InMemorySessionStore } = require("./websockets/sessionStore");
const sessionStore = new InMemorySessionStore();

global.__basedir = __dirname.split("/").splice(0, __dirname.split("/").length - 1).join("/")
global[uuid] = {}



app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api", apiRouter);

const server = http.createServer(app);
io = socketIo(server, {
  cors: {
    origin: "http://192.168.1.134:3000",
  },
});

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      return next();
    }
  }
  socket.sessionID = randomId();
  next();
});

io.on('connection', (socket) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        connected: false,
      });
    }
  });
  update();
});

global[uuid].io = io;

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

startJobs();

server.listen(process.env.PORT || 4000, '0.0.0.0',
  () => console.log(`Example app listening at http://localhost:${process.env.PORT || 4000}`)
);

//start json-server
jsonserver.use(middlewares);
jsonserver.use(router);
jsonserver.listen(4500, '127.0.0.1', () => {
  console.log("JSON Server is running")
})
