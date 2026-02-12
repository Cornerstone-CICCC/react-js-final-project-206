import { io } from 'socket.io-client';

// api.ts와 동일한 베이스 URL을 사용하되, 포트 번호를 확인하세요 (예: 4000)
const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  // 소켓은 연결을 유지해야 하므로 추가 설정이 필요할 수 있습니다.
  transports: ['websocket'],
});
