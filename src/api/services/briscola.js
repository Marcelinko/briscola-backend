const Deck = require('../models/Deck');
const io = require("./socket");

const rooms = {};

io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);

    socket.on('get rooms', () =>{
        const roomIds = Object.keys(rooms);
        socket.emit('rooms', roomIds);
    });

    socket.on('join room', (roomId) => {
        //If room with id exists and has more than 4 player
        if (rooms[roomId] && rooms[roomId].length > 4) {
            socket.emit('Soba polna');
        }
        else {
            socket.join(roomId);
            //if there are no rooms with that id create one
            if (!rooms[roomId]) {
                rooms[roomId] = {
                    players: [],
                    owner: socket.id,
                };
            }
            //add our player to the room
            rooms[roomId].players.push(socket.id);
            //send message to everyone but the sender that someone joined
            io.to(roomId).emit('player joined', socket.id);
        }
    });

    socket.on('kick player', (roomId, playerId) => {
        //if room exists and we are the owner
        if(rooms[roomId] && rooms[roomId].owner === socket.id) {
            //get the index of the player we want to kick
            const index = rooms[roomId].players.indexOf(playerId);
            if(index !== -1) {
                rooms[roomId].players.splice(index, 1);
                //tell the player that he was kicked
                io.to(playerId).emit('you were kicked');
                //tell everyone else that the player was kicked
                io.to(roomId).emit('player kicked', playerId);
            }
        }
    });

    socket.on('start game', (roomId) => {
        if(rooms[roomId] && socket.id === rooms[roomId].owner) {
            //TODO: handle game start
            io.to(roomId).emit('game started');
        }
    });

});


//TODO: Usako rundo se igralec ki igra prvi zamakne za eno mesto
//TODO: Premešaj ekipe
//TODO: Implementiraj razdelitev kart
//TODO: Implementiraj izračun točk
//TODO: Implementiraj udari ali seči: Udari se deli po 3 karte na enkrat, seči pa v krogu, ko sečemo lahko izberemo pri kateri karti bomo sekali od 1 do 39
//ce secemo pod npr. 25, grejo vse karte pod 25 nad druge karte
