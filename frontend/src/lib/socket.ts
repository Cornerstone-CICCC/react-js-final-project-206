import { io } from 'socket.io-client';

// 백엔드 서버 주소 (본인의 서버 포트에 맞게 수정하세요. 보통 3000이나 5000)
const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: true, // 앱이 켜지면 자동으로 서버와 연결 시도
});

// 연결 상태 확인용 로그 (개발할 때 편해요!)
socket.on('connect', () => {
  console.log('✅ 실시간 알림 서버에 연결되었습니다:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ 서버와 연결이 끊어졌습니다.');
});
