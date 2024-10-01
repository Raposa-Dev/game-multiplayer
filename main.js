const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 3000 });

let players = {}; // Para guardar os jogadores conectados e suas posições
let redPixel = { x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500) }; // Posição inicial do pixel vermelho

server.on('connection', (ws) => {
    const playerId = Date.now();
    players[playerId] = { x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500), points: 0 };

    ws.send(JSON.stringify({ type: 'init', id: playerId, players, redPixel }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            const player = players[data.id];
            if (data.direction === 'left') player.x -= 10;
            if (data.direction === 'right') player.x += 10;
            if (data.direction === 'up') player.y -= 10;
            if (data.direction === 'down') player.y += 10;

            // Verifica se o jogador pegou o pixel vermelho
            if (player.x === redPixel.x && player.y === redPixel.y) {
                player.points += 1;
                redPixel = { x: Math.floor(Math.random() * 500), y: Math.floor(Math.random() * 500) }; // Redefine o pixel vermelho
            }
        }

        // Envia o estado atualizado para todos os jogadores
        server.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'update', players, redPixel }));
            }
        });
    });

    ws.on('close', () => {
        delete players[playerId];
    });
});

console.log('WebSocket server running on ws://localhost:3000');
