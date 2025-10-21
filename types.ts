
export enum PlayerColor {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
}

export enum PieceType {
  PAWN = 'PAWN',
  ROOK = 'ROOK',
  KNIGHT = 'KNIGHT',
  BISHOP = 'BISHOP',
  QUEEN = 'QUEEN',
  KING = 'KING',
}

export interface Piece {
  type: PieceType;
  color: PlayerColor;
}

export interface Position {
  row: number;
  col: number;
}

export type BoardState = (Piece | null)[][];

export enum GameState {
    IN_PROGRESS = 'IN_PROGRESS',
    CHECK = 'CHECK',
    CHECKMATE = 'CHECKMATE',
    STALEMATE = 'STALEMATE',
    PROMOTION = 'PROMOTION',
}
