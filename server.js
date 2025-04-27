const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

let players = [];

server.on('connection', (ws) => {
    if (players.length < 2) {
        players.push(ws);
        ws.send(JSON.stringify({ type: 'connection', message: 'Connected to the game' }));

        if (players.length === 2) {
            players.forEach((player, index) => {
                player.send(JSON.stringify({ type: 'start', player: index + 1 }));
            });
        }

        ws.on('message', (message) => {
            players.forEach((player) => {
                if (player !== ws) {
                    player.send(message); // Отправляем сообщение другому игроку
                }
            });
        });

        ws.on('close', () => {
            players = players.filter((player) => player !== ws);
        });
    } else {
        ws.send(JSON.stringify({ type: 'error', message: 'Game full' }));
        ws.close();
    }
});

console.log('WebSocket server running on ws://localhost:8080');
