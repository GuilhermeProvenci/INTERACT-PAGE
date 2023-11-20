const WebSocket = require('ws'); 
const dotenv = require('dotenv');

dotenv.config();

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
let boxPosition; //armazenar a posição da caixa

wss.on('connection', ws => {
  ws.on('error', console.error);

  // Envia a posição inicial da caixa para o novo usuário
  if (boxPosition) {
    ws.send(JSON.stringify({ type: "initialPosition", position: boxPosition }));
  }

  ws.on('message', data => {
    const message = JSON.parse(data);
    
    // Atualiza a posição da caixa no servidor quando receber as coordenadas do cliente
    if (message.type === "updatePosition") {
      boxPosition = message.position;

      // Envie a posição atualizada para todos os clientes conectados
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "updatePosition", position: boxPosition }));
        }
      });
    } else {
      // Encaminha a mensagem para todos os clientes conectados (incluindo o remetente)
      wss.clients.forEach(client => client.send(data.toString()));
    }
  });

  console.log('Client connected');
});
