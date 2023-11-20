let box;

const user = { id: "", name: "", color: getRandomColor() };

let websocket;

function getRandomColor() {
  const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6", "#34495e"];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

function handleDragStart(event) {
  if (websocket.readyState !== WebSocket.OPEN) {
    return;
  }

  const startCoords = { x: event.clientX, y: event.clientY };
  const dragData = { type: "dragStart", startCoords };
  websocket.send(JSON.stringify(dragData));

  document.addEventListener("mousemove", handleDragging);
  document.addEventListener("mouseup", handleDragEnd);

  function handleDragging(event) {
    if (websocket.readyState !== WebSocket.OPEN) {
      return;
    }
  
    const currentCoords = { x: event.clientX, y: event.clientY };
    const dragData = { type: "dragging", currentCoords };
  
    // Atualiza a posição da caixa no servidor
    websocket.send(JSON.stringify({ type: "updatePosition", position: currentCoords }));
    websocket.send(JSON.stringify(dragData));
  }
  

  function handleDragEnd() {
    if (websocket.readyState !== WebSocket.OPEN) {
      return;
    }

    document.removeEventListener("mousemove", handleDragging);
    document.removeEventListener("mouseup", handleDragEnd);
    const dragData = { type: "dragEnd" };
    websocket.send(JSON.stringify(dragData));
  }
}

function processDragData(dragData) {
  switch (dragData.type) {
    case "dragStart":
      // início do drag (se necessário)
      break;
    case "dragging":
      // posição durante o drag
      box.style.left = dragData.currentCoords.x + "px";
      box.style.top = dragData.currentCoords.y + "px";
      break;
    case "dragEnd":
      // fim do drag (se necessário)
      break;
    case "initialPosition":
      // Configura a posição inicial da caixa quando um novo usuário se conecta
      box.style.left = dragData.position.x + "px";
      box.style.top = dragData.position.y + "px";
      break;
  }
}

function createDraggableBox() {
  const newBox = document.createElement("div");
  newBox.classList.add("draggable-box");
  newBox.style.backgroundColor = user.color;
  newBox.style.width = "100px";
  newBox.style.height = "100px";
  newBox.style.position = "absolute"; 
  document.body.appendChild(newBox);

  return newBox;
}

function promptForUsername() {
  const username = prompt("Digite seu nome de usuário:");
  if (username) {
    user.id = crypto.randomUUID();
    user.name = username;
    websocket = new WebSocket("ws://localhost:8080");

    box = createDraggableBox();

    websocket.onmessage = event => {
      const dragData = JSON.parse(event.data);
      processDragData(dragData);
    };

    // Solicita a posição inicial da caixa quando um novo usuário se conecta
    websocket.onopen = () => {
      websocket.send(JSON.stringify({ type: "requestInitialPosition" }));
    };

    box.addEventListener("mousedown", handleDragStart);
  } else {
    // cancelou o prompt
  }
}

promptForUsername();
