const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
var path = require('path');
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = 3000;
var players = [];

var game_data = {
    'player1': {
        role: "chaser",
        x: 0,
        y: 0,
        activeAnim: "standing",
        direction: "right",
        game_over: false,
        ready: false,
        skinIndex: 0
    },
    'player2': {
        role: "chased",
        x: 0,
        y: 0,
        activeAnim: "standing",
        direction: "right",
        game_over: false,
        ready: false,
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
        player.game_over = data.game_over;
        player.ready = data.ready;
    }
};

app.use("/src", express.static('./src/'));
app.use("/node_modules", express.static('./node_modules/'));
app.use("/ressources", express.static('./ressources/'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('src/menu/index.html'));
});

app.get('/game', (req, res) => {
    if (players.length == 2)
        res.send('<h1>Sorry, lobby is full...</h1>');
    else
        res.sendFile(path.resolve('src/game/index.html'));
});

io.on('connection', (socket) => {
    if (players.length === 0)
        socket.name = 'player:1';
    else
        socket.name = players[0] === 'player:1' ? 'player:2' : 'player:1';

    players.push(`player:${players.length+1}`);
    console.log(`${socket.name} connected.`);

    socket.emit('playerInfo', {'players':players, 'name':socket.name});

    if (game_data.player1.ready) {
        socket.emit('game_over');
        game_data.player1.game_over = false;
        game_data.player1.game_over = false;
    }
    socket.on('trade_player_pos', (data, callback) => {
        game_data.setValues(data);
        callback({
                'player_info': data.id === "player:1" ? game_data.player2 : game_data.player1,
                'game_over': game_data.player1.game_over || game_data.player2.game_over
        });
    });
    socket.on('two_player_connected', (callback) => callback(players.length == 2));
    socket.on('disconnect', () => {
        console.log(`${players[players.indexOf(socket.name)]} as disconnected.`);
        players.splice(players.indexOf(socket.name), 1);
    });
});

server.listen(PORT, () => {
    console.log(`Server up!\n -> http://localhost:${PORT}`);
});