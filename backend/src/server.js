// server.js
const { WebSocketServer } = require('ws');
const dotenv = require('dotenv');

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });
let boxPosition; // Adiciona uma variável para armazenar a posição da caixa

wss.on('connection', ws => {
  ws.on('error', console.error);

  // Envia a posição inicial da caixa para o novo usuário
  if (boxPosition) {
    ws.send(JSON.stringify({ type: "initialPosition", position: boxPosition }));
  }

  ws.on('message', data => {
    wss.clients.forEach(client => client.send(data.toString()));
  });

  console.log('Client connected');
});