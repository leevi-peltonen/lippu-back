import { Injectable } from '@nestjs/common';
import { Room } from './room.interface';

interface Country {
    code: string;
    name: string;
}

interface GameState {
    currentTurn: string;
    currentTurnNumber: number;
    currentFlag: Country;
    options: Country[];
    guesses: { [userId: string]: string };
    points: { [userId: string]: number };
    gameOver: boolean;
}

@Injectable()
export class RoomService {
  private rooms: Room[] = [];
  private gameState: { [roomCode: string]: GameState } = {};

  private generateRoomCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private generateNewTurn(roomCode:string): void {
    const nextTurnNumber = this.gameState[roomCode].currentTurnNumber + 1
    const room = this.getRoom(roomCode)
    const nextPlayer = room.users.find(user => user !== this.gameState[roomCode].currentTurn);
    const flag = this.getCountryCode(room.difficulty);
    const options = this.getWrongAnswers(room.difficulty, flag.code)

    if(nextTurnNumber > room.length * 2) {
        this.gameState[roomCode].gameOver = true
        return
    }

    this.gameState[roomCode] = {
        ...this.gameState[roomCode],
        currentTurn: nextPlayer,
        currentFlag: flag,
        currentTurnNumber: nextTurnNumber,
        options
    }
  }

  createRoom(userId: string, difficulty: 'easy' | 'medium' | 'hard', length: number): Room {
    const room: Room = { code: this.generateRoomCode(), users: [userId], difficulty, length};
    this.rooms.push(room);
    const flag = this.getCountryCode(difficulty)
    const options = this.getWrongAnswers(difficulty, flag.code)
    this.gameState[room.code] = { currentTurn: userId, currentFlag: flag, options, guesses: {}, points: {}, currentTurnNumber: 1, gameOver: false};
    console.log(`User ${userId} has created room ${room.code}`);
    return room;
  }

  joinRoom(code: string, userId: string): Room {
    console.log(`User ${userId} is trying to join room ${code}`)
    const room = this.rooms.find(room => room.code.toUpperCase() === code.toUpperCase());
    if (!room) {
      throw new Error('Room not found');
    }
    room.users.push(userId);
    console.log(`User ${userId} has joined room ${code}`);
    return room;
  }

  leaveRoom(code: string, userId: string): void {
    const room = this.rooms.find(room => room.code === code);
    if (room) {
      room.users = room.users.filter(user => user !== userId);
      console.log(`User ${userId} has left room ${code}`);
      if (room.users.length === 0) {
        this.rooms = this.rooms.filter(r => r.code !== code);
        delete this.gameState[code];
        console.log(`Room ${code} has been deleted`);
      }
    }
  }

  getRoom(code: string): Room {
    return this.rooms.find(room => room.code === code);
  }

  getUsersInRoom(code: string): string[] {
    const room = this.rooms.find(room => room.code === code);
    return room ? room.users : [];
  }

  getGameState(code: string): GameState {
    return this.gameState[code];
  }

  makeGuess(code: string, userId: string, guess:string): void {
    const gameState = this.gameState[code];
    if (gameState.currentTurn !== userId) {
      throw new Error('Not your turn');
    }
    gameState.guesses[userId] = guess;
    if(guess === gameState.currentFlag.code) {
        gameState.points[userId] = (gameState.points[userId] || 0) + 1;

    }
    this.generateNewTurn(code)
  }

  getCountryCode(difficulty: 'easy' | 'medium' | 'hard'): { code: string, name: string } {

    switch (difficulty) {
        case 'easy':
            return EASY_COUNTRIES[Math.floor(Math.random() * EASY_COUNTRIES.length)];
        case 'medium':
            return MEDIUM_COUNTRIES[Math.floor(Math.random() * MEDIUM_COUNTRIES.length)];
        case 'hard':
            return HARD_COUNTRIES[Math.floor(Math.random() * HARD_COUNTRIES.length)];
        }
  }

  getWrongAnswers(difficulty: 'easy' | 'medium' | 'hard', correctCountryCode: string): Country[] {
    switch (difficulty) {
        case 'easy':
            return EASY_COUNTRIES
                .filter(country => country.code !== correctCountryCode)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                
        case 'medium':
            return MEDIUM_COUNTRIES
                .filter(country => country.code !== correctCountryCode)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                
        case 'hard':
            return HARD_COUNTRIES
                .filter(country => country.code !== correctCountryCode)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                
    }
  }
}

const EASY_COUNTRIES = [
    { code: 'FI', name: 'Suomi' },
    { code: 'SE', name: 'Ruotsi' },
    { code: 'NO', name: 'Norja' },
    { code: 'DK', name: 'Tanska' },
    { code: 'IS', name: 'Islanti' },
    { code: 'EE', name: 'Viro' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LT', name: 'Liettua' },
    { code: 'PL', name: 'Puola' },
    { code: 'DE', name: 'Saksa' },
    { code: 'CZ', name: 'Tsekki' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'HU', name: 'Unkari' },
    { code: 'AT', name: 'Itävalta' },
    { code: 'CH', name: 'Sveitsi' },
    { code: 'LI', name: 'Lichtenstain' },
    { code: 'NL', name: 'Hollanti' },
    { code: 'BE', name: 'Belgia' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'FR', name: 'Ranska' },
    { code: 'ES', name: 'Espanja' },
    { code: 'PT', name: 'Portugali' },
    { code: 'IT', name: 'Italia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'RU', name: 'Venäjä' },
    { code: 'GR', name: 'Kreikka' },
    { code: 'TR', name: 'Turkki' },
    { code: 'CY', name: 'Kypros' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'RO', name: 'Romania' },
    { code: 'MD', name: 'Moldova' }
]

const MEDIUM_COUNTRIES = [
    { code: 'ZA', name: 'Etelä-Afrikka' },
    { code: 'KR', name: 'Etelä-Korea' },
    { code: 'MX', name: 'Meksiko' },
    { code: 'AR', name: 'Argentiina' },
    { code: 'AU', name: 'Australia' },
    { code: 'BA', name: 'Bosnia ja Herzegovina' },
    { code: 'HR', name: 'Kroatia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'AL', name: 'Albania' },
    { code: 'MK', name: 'Pohjois makedonia' },
]


const HARD_COUNTRIES = [
    { code: 'AG', name: 'Antigua ja Barbuda' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'KH', name: 'Kambodža' },
    { code: 'KM', name: 'Komorit' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'FJ', name: 'Fidži' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'MR', name: 'Mauritania' },
    { code: 'WS', name: 'Samoa' },
    { code: 'TL', name: 'Itä-Timor' }
]