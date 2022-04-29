const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
var path = require('path');
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = 3000;
var nb_player = 0;
var players = [];

var game_data = {
    'player1': {
        x: 0,
        y: 0
    },
    'player2': {
        x: 0,
        y: 0
    }
}

app.use("/frontend", express.static('./frontend/'));
app.use("/node_modules", express.static('./node_modules/'));
app.use("/ressources", express.static('./ressources/'));

app.get('/', (req, res) => {
    if (nb_player == 2)
        res.send('<h1>Sorry, lobby is full...</h1>');
    else
        res.sendFile(path.resolve('index.html'));
});

io.on('connection', (socket) => {
    socket.name = `player:${++nb_player}`;
    // console.log(socket.id);
    console.log(`Player${nb_player} connected.`);
    players.push(`player:${nb_player}`);
    socket.emit('playerInfo', {'players':players, 'name':socket.name});
    socket.on('disconnect', () => {
        console.log(`A player as disconnected, ${--nb_player} left.`);
    });
});

server.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
});