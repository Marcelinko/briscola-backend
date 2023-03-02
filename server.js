const express = require('express');
const cors = require('cors');

const app = express();
const server = require('http').createServer(app);
const io = require('./src/api/services/socket');
io.listen(server);

require('./src/api/services/briscola');

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
}));

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));