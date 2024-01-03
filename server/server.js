// server.js

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const Room = require('./rooms');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 방 관리 객체 생성
const rooms = new Map();

wss.on('connection', (ws, request, client) => {
    console.log('클라이언트가 연결되었습니다.');
  
    // 클라이언트가 특정 방에 들어가도록 설정 (여기서는 간단히 방 이름을 URL 파라미터로 받음)
    const urlParams = new URLSearchParams(request.url.slice(2));
    const roomName = urlParams.get('room') || 'default';
  
    // 방이 없으면 새로운 방 생성
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Room());
    }
  
    const currentRoom = rooms.get(roomName);
  
    // 클라이언트를 방에 추가
    currentRoom.addClient(ws);
  
    ws.on('message', (message) => {
      // 클라이언트로부터 메시지를 받았을 때의 로직
      // 받은 메시지를 해당 방의 모든 클라이언트에게 전송
      currentRoom.broadcast(message);
    });
  
    ws.on('close', () => {
      console.log('클라이언트 연결이 종료되었습니다.');
      // 클라이언트가 연결을 종료하면 해당 방에서 클라이언트 제거
      currentRoom.removeClient(ws);
    });
  });
  

// 정적 파일 서빙 (웹 소켓 클라이언트를 위한 HTML 및 JavaScript 파일)
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
