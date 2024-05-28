export interface Room {
    code: string
    users: string[]
    difficulty: 'easy' | 'medium' | 'hard'
    length: number
    gamemode: 'Klassikko' | 'Aikapommi'
}