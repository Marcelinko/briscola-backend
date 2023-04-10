const express = require('express');
const cors = require('cors');
const roomHandler = require('./src/api/handlers/roomHandler');
const briscolaHandler = require('./src/api/handlers/briscolaHandler');

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3001',
}));

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

io.listen(server);

const routes = require('./src/api/routes/routes');
const { leaveAllRooms } = require('./src/api/utils/roomUtils');
app.use('/api', routes);

const onConnection = (socket) => {
    console.log(`User ${socket.id} connected`);
    roomHandler(io, socket);
    //briscolaHandler(io, socket);
    //chessHandler(io, socket);
};

io.on('connection', onConnection);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));