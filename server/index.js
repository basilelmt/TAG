// I don't unserstand how to send signal to server

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
        role: "chaser",
        x: 0,
        y: 0,
        activeAnim: "standing",
        direction: "right",
        skinIndex: 0
    },
    'player2': {
        role: "chased",
        x: 0,
        y: 0,
        activeAnim: "standing",
        direction: "right",
        skinIndex: 0
    },
    setValues(data) {
        let player = data.id === "player:1" ? this.player1 : this.player2;
        player.role = data.role;
        player.x = data.x;
        player.y = data.y;
        player.activeAnim = data.activeAnim;
        player.direction = data.direction;
        player.skinIndex = data.skinIndex;
    }
};

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
    console.log(`Player${nb_player} connected.`);
    players.push(`player:${nb_player}`);
    socket.emit('playerInfo', {'players':players, 'name':socket.name});
    socket.on('trade_player_pos', (data, callback) => {
        game_data.setValues(data);
        callback(
            data.id === "player:1" ? game_data.player2 : game_data.player1
        );
    });
    socket.on('two_player_connected', (callback) => callback(nb_player == 2));
    socket.on('disconnect', () => {
        console.log(`A player as disconnected, ${--nb_player} left.`);
    });
});

server.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
});