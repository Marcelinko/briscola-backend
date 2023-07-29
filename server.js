const express = require("express");
const cors = require("cors");
const roomHandler = require("./src/api/handlers/roomHandler");
const briscolaHandler = require("./src/api/handlers/briscolaHandler");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

//Api
// const defaultRoutes = require("./src/api/routes/routes");
// app.use("/api", defaultRoutes);

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.listen(server);

const onConnection = (socket) => {
  roomHandler(io, socket);
  briscolaHandler(io, socket);
};

io.on("connection", onConnection);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);
