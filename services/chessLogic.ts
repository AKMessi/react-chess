
import { BoardState, Piece, PieceType, PlayerColor, Position } from '../types';

const isSamePosition = (a: Position, b: Position) => a.row === b.row && a.col === b.col;

const isOutOfBounds = (row: number, col: number) => row < 0 || row > 7 || col < 0 || col > 7;

function getPawnMoves(position: Position, piece: Piece, board: BoardState): Position[] {
    const moves: Position[] = [];
    const { row, col } = position;
    const direction = piece.color === PlayerColor.WHITE ? -1 : 1;
    const startRow = piece.color === PlayerColor.WHITE ? 6 : 1;

    // Forward 1
    if (!isOutOfBounds(row + direction, col) && !board[row + direction][col]) {
        moves.push({ row: row + direction, col });
    }

    // Forward 2 from start
    if (row === startRow && !board[row + direction][col] && !board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col });
    }

    // Capture
    [-1, 1].forEach(side => {
        const newCol = col + side;
        const newRow = row + direction;
        if (!isOutOfBounds(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (target && target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    });

    return moves;
}

function getSlidingMoves(position: Position, piece: Piece, board: BoardState, directions: number[][]): Position[] {
    const moves: Position[] = [];
    const { row, col } = position;

    for (const [dr, dc] of directions) {
        let newRow = row + dr;
        let newCol = col + dc;

        while (!isOutOfBounds(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (target) {
                if (target.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol });
                }
                break; // Blocked
            }
            moves.push({ row: newRow, col: newCol });
            newRow += dr;
            newCol += dc;
        }
    }
    return moves;
}

function getKnightMoves(position: Position, piece: Piece, board: BoardState): Position[] {
    const moves: Position[] = [];
    const { row, col } = position;
    const directions = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (!isOutOfBounds(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    return moves;
}

function getKingMoves(position: Position, piece: Piece, board: BoardState): Position[] {
    const moves: Position[] = [];
    const { row, col } = position;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (!isOutOfBounds(newRow, newCol)) {
            const target = board[newRow][newCol];
            if (!target || target.color !== piece.color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    return moves;
}

function getPseudoLegalMoves(position: Position, board: BoardState): Position[] {
    const piece = board[position.row][position.col];
    if (!piece) return [];

    switch (piece.type) {
        case PieceType.PAWN:
            return getPawnMoves(position, piece, board);
        case PieceType.ROOK:
            return getSlidingMoves(position, piece, board, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
        case PieceType.BISHOP:
            return getSlidingMoves(position, piece, board, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
        case PieceType.QUEEN:
            return getSlidingMoves(position, piece, board, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
        case PieceType.KNIGHT:
            return getKnightMoves(position, piece, board);
        case PieceType.KING:
            return getKingMoves(position, piece, board);
        default:
            return [];
    }
}

function findKingPosition(color: PlayerColor, board: BoardState): Position | null {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.type === PieceType.KING && piece.color === color) {
                return { row: r, col: c };
            }
        }
    }
    return null;
}

export function isPositionUnderAttack(position: Position, attackingColor: PlayerColor, board: BoardState): boolean {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color === attackingColor) {
                const moves = getPseudoLegalMoves({ row: r, col: c }, board);
                if (moves.some(move => isSamePosition(move, position))) {
                    return true;
                }
            }
        }
    }
    return false;
}

export function isKingInCheck(color: PlayerColor, board: BoardState): boolean {
    const kingPos = findKingPosition(color, board);
    if (!kingPos) return false;
    const opponentColor = color === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    return isPositionUnderAttack(kingPos, opponentColor, board);
}

export function getValidMoves(position: Position, board: BoardState): Position[] {
    const piece = board[position.row][position.col];
    if (!piece) return [];
    
    const pseudoLegalMoves = getPseudoLegalMoves(position, board);
    const validMoves: Position[] = [];

    for (const move of pseudoLegalMoves) {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[move.row][move.col] = piece;
        newBoard[position.row][position.col] = null;

        if (!isKingInCheck(piece.color, newBoard)) {
            validMoves.push(move);
        }
    }
    return validMoves;
}

function getAllPiecesForPlayer(color: PlayerColor, board: BoardState): { piece: Piece, position: Position }[] {
    const pieces: { piece: Piece, position: Position }[] = [];
     for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece && piece.color === color) {
                pieces.push({ piece, position: { row: r, col: c } });
            }
        }
    }
    return pieces;
}

export function hasLegalMoves(color: PlayerColor, board: BoardState): boolean {
    const playerPieces = getAllPiecesForPlayer(color, board);
    for (const { position } of playerPieces) {
        if (getValidMoves(position, board).length > 0) {
            return true;
        }
    }
    return false;
}

export function isCheckmate(color: PlayerColor, board: BoardState): boolean {
    return isKingInCheck(color, board) && !hasLegalMoves(color, board);
}

export function isStalemate(color: PlayerColor, board: BoardState): boolean {
    return !isKingInCheck(color, board) && !hasLegalMoves(color, board);
}
