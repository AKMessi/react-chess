
import React from 'react';
import { BoardState, Piece, PieceType, PlayerColor } from './types';

const R = (color: PlayerColor): Piece => ({ type: PieceType.ROOK, color });
const N = (color: PlayerColor): Piece => ({ type: PieceType.KNIGHT, color });
const B = (color: PlayerColor): Piece => ({ type: PieceType.BISHOP, color });
const Q = (color: PlayerColor): Piece => ({ type: PieceType.QUEEN, color });
const K = (color: PlayerColor): Piece => ({ type: PieceType.KING, color });
const P = (color: PlayerColor): Piece => ({ type: PieceType.PAWN, color });

export const INITIAL_BOARD: BoardState = [
  [R(PlayerColor.BLACK), N(PlayerColor.BLACK), B(PlayerColor.BLACK), Q(PlayerColor.BLACK), K(PlayerColor.BLACK), B(PlayerColor.BLACK), N(PlayerColor.BLACK), R(PlayerColor.BLACK)],
  [P(PlayerColor.BLACK), P(PlayerColor.BLACK), P(PlayerColor.BLACK), P(PlayerColor.BLACK), P(PlayerColor.BLACK), P(PlayerColor.BLACK), P(PlayerColor.BLACK), P(PlayerColor.BLACK)],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [P(PlayerColor.WHITE), P(PlayerColor.WHITE), P(PlayerColor.WHITE), P(PlayerColor.WHITE), P(PlayerColor.WHITE), P(PlayerColor.WHITE), P(PlayerColor.WHITE), P(PlayerColor.WHITE)],
  [R(PlayerColor.WHITE), N(PlayerColor.WHITE), B(PlayerColor.WHITE), Q(PlayerColor.WHITE), K(PlayerColor.WHITE), B(PlayerColor.WHITE), N(PlayerColor.WHITE), R(PlayerColor.WHITE)],
];

const PieceComponent: React.FC<{ piece: Piece }> = ({ piece }) => {
    const { type, color } = piece;
    const pieceColor = color === PlayerColor.WHITE ? '#FFFFFF' : '#2d2d2d';
    const strokeColor = color === PlayerColor.WHITE ? '#2d2d2d' : '#FFFFFF';

    // FIX: Use React.ReactElement instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error.
    const svgs: Record<PieceType, React.ReactElement> = {
        [PieceType.PAWN]: <svg viewBox="0 0 45 45"><g fill={pieceColor} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.2-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.42-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" /></g></svg>,
        [PieceType.ROOK]: <svg viewBox="0 0 45 45"><g fill={pieceColor} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" /><path d="M34 14l-3 3H14l-3-3" /><path d="M31 17v12.5H14V17" /><path d="M31 29.5l1.5 2.5h-20l1.5-2.5" /><path d="M14 17h17" fill="none" stroke={strokeColor} /></g></svg>,
        [PieceType.KNIGHT]: <svg viewBox="0 0 45 45"><g fill={pieceColor} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c-2 0-9-1.5-8-10 .5-4 4-4 4-4 0-3 0-7.5 3-10.5 2-2 6-2.5 8-2.5z" /><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.16.59-3.23 2-4 .5-4-4-2.5-4-2.5-4.5-1.5-4.5-5-3.5-7 1-2 3-2 3-2zM28 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill={strokeColor} stroke={pieceColor} /></g></svg>,
        [PieceType.BISHOP]: <svg viewBox="0 0 45 45"><g fill={pieceColor} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 1.65 2.48V41H7.35v-2.52c0-1.94 1.65-2.48 1.65-2.48z" /><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" /><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" /></g></svg>,
        [PieceType.QUEEN]: <svg viewBox="0 0 45 45"><g fill={pieceColor} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0zM22.5 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0zM37 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0zM42 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0zM13 12a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" /><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L15 11v14L8 14l1 12z" /><path d="M9 26c0 2 1.5 4 4 4h14c2.5 0 4-2 4-4 0-4 1.5-1.5 0-5.5-1.5-4-3-5.5-3-5.5-2-4-7-4-7-4-2.5-3-12.5-3-15 0" /></g></svg>,
        [PieceType.KING]: <svg viewBox="0 0 45 45"><g fill={pieceColor} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke={strokeColor} /><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1.5-3-3-3s-3 3-3 3c-1.5 3 3 10.5 3 10.5" fill={pieceColor} stroke={strokeColor} /><path d="M12 35.5s3-4 4-6.5c1-2.5 1-8.5 7.5-8.5s6.5 6 7.5 8.5c1 2.5 4 6.5 4 6.5" /><path d="M12 35.5h21" /><path d="M11 38h23" /><path d="M12 35.5s-2 0-2 2.5c0 2.5 2 2.5 2 2.5" /><path d="M33 35.5s2 0 2 2.5c0 2.5-2 2.5-2 2.5" /></g></svg>
    };

    return <div className="w-full h-full cursor-pointer">{svgs[type]}</div>;
};

// FIX: Use React.ReactElement instead of JSX.Element to resolve "Cannot find namespace 'JSX'" error.
export const PIECE_COMPONENTS: Record<PlayerColor, Record<PieceType, React.ReactElement>> = {
  [PlayerColor.WHITE]: {
    [PieceType.PAWN]: <PieceComponent piece={{ type: PieceType.PAWN, color: PlayerColor.WHITE }} />,
    [PieceType.ROOK]: <PieceComponent piece={{ type: PieceType.ROOK, color: PlayerColor.WHITE }} />,
    [PieceType.KNIGHT]: <PieceComponent piece={{ type: PieceType.KNIGHT, color: PlayerColor.WHITE }} />,
    [PieceType.BISHOP]: <PieceComponent piece={{ type: PieceType.BISHOP, color: PlayerColor.WHITE }} />,
    [PieceType.QUEEN]: <PieceComponent piece={{ type: PieceType.QUEEN, color: PlayerColor.WHITE }} />,
    [PieceType.KING]: <PieceComponent piece={{ type: PieceType.KING, color: PlayerColor.WHITE }} />,
  },
  [PlayerColor.BLACK]: {
    [PieceType.PAWN]: <PieceComponent piece={{ type: PieceType.PAWN, color: PlayerColor.BLACK }} />,
    [PieceType.ROOK]: <PieceComponent piece={{ type: PieceType.ROOK, color: PlayerColor.BLACK }} />,
    [PieceType.KNIGHT]: <PieceComponent piece={{ type: PieceType.KNIGHT, color: PlayerColor.BLACK }} />,
    [PieceType.BISHOP]: <PieceComponent piece={{ type: PieceType.BISHOP, color: PlayerColor.BLACK }} />,
    [PieceType.QUEEN]: <PieceComponent piece={{ type: PieceType.QUEEN, color: PlayerColor.BLACK }} />,
    [PieceType.KING]: <PieceComponent piece={{ type: PieceType.KING, color: PlayerColor.BLACK }} />,
  }
};