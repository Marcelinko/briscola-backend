const games = require("../../config/games");
const engines = require("../engines/Engines");
const Room = require("../models/Room/Room");
const SystemMessage = require("../models/Room/SystemMessage");

const rooms = {};

const generateRoomId = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

getGameById = (gameId) => {
    return games.find(game => game.id === gameId);
}

const createNewRoom = (gameId, socketId) => {
    const roomId = generateRoomId();
    const game = getGameById(gameId);
    const engine = engines[gameId];
    const room = new Room(roomId, socketId, game, engine)
    rooms[roomId] = room;
    return room;
}

const getRoomById = (roomId) => {
    return rooms[roomId];
}

const deleteRoom = (roomId) => {
    delete rooms[roomId];
    console.log(`Room ${roomId} deleted`);
}

const getRooms = () => {
    return rooms;
}


module.exports = {
    createNewRoom,
    getRoomById,
    deleteRoom,
    getRooms,
}