import { SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';

@WebSocketGateway({
    cors: {
        origin: 'https://courageous-bubblegum-433632.netlify.app',
        methods: ['GET', 'POST'],
        credentials: true,
    }
})
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private roomService: RoomService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(client: Socket, data: {userId: string, difficulty: 'easy'|'medium'|'hard', length: number, gamemode: 'Klassikko' | 'Aikapommi'}): void {
    const room = this.roomService.createRoom(data.userId, data.difficulty, data.length, data.gamemode);
    client.join(room.code);
    client.emit('roomCreated', room.code);
    this.server.to(room.code).emit('userJoined', data.userId);
    this.server.to(room.code).emit('updateUsers', this.roomService.getUsersInRoom(room.code));
    this.server.to(room.code).emit('updateGameState', this.roomService.getGameState(room.code));
    this.server.emit('rooms', this.roomService.getAllRooms())
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, data: { roomCode: string, userId: string }): void {
    try {
      const room = this.roomService.joinRoom(data.roomCode, data.userId);
      client.join(room.code);
      this.server.to(room.code).emit('userJoined', data.userId);
      this.server.to(room.code).emit('updateUsers', this.roomService.getUsersInRoom(room.code));
      this.server.to(room.code).emit('updateGameState', this.roomService.getGameState(room.code));
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, data: { roomCode: string, userId: string }): void {
    this.roomService.leaveRoom(data.roomCode, data.userId);
    client.leave(data.roomCode);
    this.server.to(data.roomCode).emit('userLeft', data.userId);
    this.server.to(data.roomCode).emit('updateUsers', this.roomService.getUsersInRoom(data.roomCode));
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, data: { roomCode: string, message: string, userId: string }): void {
    this.server.to(data.roomCode).emit('message', { userId: data.userId, message: data.message });
  }

  @SubscribeMessage('makeGuess')
  handleMakeGuess(client: Socket, data: { roomCode: string, userId: string, guess: string }): void {
    try {
      this.roomService.makeGuess(data.roomCode, data.userId, data.guess);
      this.server.to(data.roomCode).emit('updateGameState', this.roomService.getGameState(data.roomCode));
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('requestRooms')
  handleRequestRooms(client:Socket): void {
    const rooms = this.roomService.getAllRooms()
    client.emit('rooms', rooms)
  }

  @SubscribeMessage('requestFlags')
  handleRequestFlags(client: Socket, data: {difficulty: 'easy' | 'medium' | 'hard', roomCode: string, userId: string}): void {
    const country = this.roomService.getCountryCode(data.difficulty);
    const wrongAnswers = this.roomService.getWrongAnswers(data.difficulty, country.code);
    this.server.to(data.roomCode).emit('flags', { country, wrongAnswers, userId: data.userId });
  }
}
