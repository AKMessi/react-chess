
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BoardState, GameState, Piece, PieceType, PlayerColor, Position } from './types';
import { INITIAL_BOARD, PIECE_COMPONENTS } from './constants';
import { getValidMoves, isKingInCheck, isCheckmate, isStalemate } from './services/chessLogic';

// Helper to check for position equality
const posEquals = (a: Position | null, b: Position | null) => a && b && a.row === b.row && a.col === b.col;

const ANIMATION_DURATION = 300; // ms

// AnimatedPiece Component for movement
const AnimatedPiece: React.FC<{ piece: Piece; from: Position; to: Position }> = ({ piece, from, to }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        top: `${from.row * 12.5}%`,
        left: `${from.col * 12.5}%`,
        zIndex: 10,
    });

    useEffect(() => {
        // Delay to ensure the initial state is rendered before transitioning
        requestAnimationFrame(() => {
            setStyle({
                top: `${to.row * 12.5}%`,
                left: `${to.col * 12.5}%`,
                transition: `top ${ANIMATION_DURATION}ms ease-in-out, left ${ANIMATION_DURATION}ms ease-in-out`,
                zIndex: 10,
            });
        });
    }, [to]);

    return (
        <div className="absolute w-[12.5%] h-[12.5%]" style={style}>
            {PIECE_COMPONENTS[piece.color][piece.type]}
        </div>
    );
};

// CapturedPiece Component for capture animation
const CapturedPiece: React.FC<{ piece: Piece; at: Position }> = ({ piece, at }) => {
    const [style, setStyle] = useState<React.CSSProperties>({
        top: `${at.row * 12.5}%`,
        left: `${at.col * 12.5}%`,
        transform: 'scale(1)',
        opacity: 1,
        zIndex: 5,
    });

    useEffect(() => {
        requestAnimationFrame(() => {
            setStyle({
                top: `${at.row * 12.5}%`,
                left: `${at.col * 12.5}%`,
                transform: 'scale(0.5)',
                opacity: 0,
                transition: `all ${ANIMATION_DURATION}ms ease-in-out`,
                zIndex: 5,
            });
        });
    }, [at]);
    
    return (
        <div className="absolute w-[12.5%] h-[12.5%]" style={style}>
            {PIECE_COMPONENTS[piece.color][piece.type]}
        </div>
    );
};

// Square Component
interface SquareProps {
  piece: Piece | null;
  position: Position;
  isSelected: boolean;
  isPossibleMove: boolean;
  isInCheck: boolean;
  onClick: (position: Position) => void;
}

const Square: React.FC<SquareProps> = ({ piece, position, isSelected, isPossibleMove, isInCheck, onClick }) => {
  const { row, col } = position;
  const isLight = (row + col) % 2 === 0;
  
  const bgClass = isLight ? 'bg-neutral-200' : 'bg-green-700';
  const selectedClass = isSelected ? 'bg-yellow-400' : '';
  const checkClass = isInCheck ? 'bg-red-500' : '';

  return (
    <div
      className={`w-full h-full flex justify-center items-center relative ${checkClass || selectedClass || bgClass}`}
      onClick={() => onClick(position)}
    >
      {piece && PIECE_COMPONENTS[piece.color][piece.type]}
      {isPossibleMove && (
        <div className="absolute w-1/3 h-1/3 bg-green-500 rounded-full opacity-50"></div>
      )}
    </div>
  );
};


// Main App Component
const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>(PlayerColor.WHITE);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.IN_PROGRESS);
  const [kingInCheckPos, setKingInCheckPos] = useState<Position | null>(null);
  const [promotionPos, setPromotionPos] = useState<Position | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{[key in PlayerColor]: Piece[]}>({ WHITE: [], BLACK: [] });
  
  interface AnimationDetails {
    moving: { piece: Piece; from: Position; to: Position; };
    captured?: { piece: Piece; at: Position; };
  }
  const [animationDetails, setAnimationDetails] = useState<AnimationDetails | null>(null);
  const isAnimating = !!animationDetails;


  const updateGameStatus = useCallback((currentBoard: BoardState, player: PlayerColor) => {
    const opponent = player === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    
    if (isCheckmate(opponent, currentBoard)) {
      setGameState(GameState.CHECKMATE);
    } else if (isStalemate(opponent, currentBoard)) {
      setGameState(GameState.STALEMATE);
    } else if (isKingInCheck(opponent, currentBoard)) {
      setGameState(GameState.CHECK);
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = currentBoard[r][c];
          if (piece?.type === PieceType.KING && piece?.color === opponent) {
            setKingInCheckPos({ row: r, col: c });
            return;
          }
        }
      }
    } else {
      setGameState(GameState.IN_PROGRESS);
      setKingInCheckPos(null);
    }
  }, []);
  
  const handleSquareClick = (position: Position) => {
    if (isAnimating || gameState === GameState.CHECKMATE || gameState === GameState.STALEMATE || gameState === GameState.PROMOTION) return;
    
    const clickedPiece = board[position.row][position.col];

    if (selectedPiece) {
      if (validMoves.some(move => posEquals(move, position))) {
        const pieceToMove = board[selectedPiece.row][selectedPiece.col]!;
        const capturedPiece = board[position.row][position.col];
        const fromPos = { ...selectedPiece };

        setSelectedPiece(null);
        setValidMoves([]);
        
        setAnimationDetails({
            moving: { piece: pieceToMove, from: fromPos, to: position },
            captured: capturedPiece ? { piece: capturedPiece, at: position } : undefined
        });

        setTimeout(() => {
            const newBoard = JSON.parse(JSON.stringify(board));

            const captured = newBoard[position.row][position.col];
            if(captured) {
                const newCaptured = {...capturedPieces};
                newCaptured[captured.color].push(captured);
                setCapturedPieces(newCaptured);
            }

            newBoard[position.row][position.col] = pieceToMove;
            newBoard[fromPos.row][fromPos.col] = null;
            
            if (pieceToMove.type === PieceType.PAWN && (position.row === 0 || position.row === 7)) {
                setPromotionPos(position);
                setGameState(GameState.PROMOTION);
                setBoard(newBoard);
                setAnimationDetails(null);
                return;
            }

            setBoard(newBoard);
            const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
            setCurrentPlayer(nextPlayer);
            updateGameStatus(newBoard, currentPlayer);
            setAnimationDetails(null);
        }, ANIMATION_DURATION);

      } else if (clickedPiece && clickedPiece.color === currentPlayer) {
        setSelectedPiece(position);
        setValidMoves(getValidMoves(position, board));
      } else {
        setSelectedPiece(null);
        setValidMoves([]);
      }
    } else if (clickedPiece && clickedPiece.color === currentPlayer) {
      setSelectedPiece(position);
      setValidMoves(getValidMoves(position, board));
    }
  };
  
  const handlePromotion = (pieceType: PieceType) => {
    if (!promotionPos) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    newBoard[promotionPos.row][promotionPos.col] = { type: pieceType, color: currentPlayer };
    setBoard(newBoard);
    
    const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    setCurrentPlayer(nextPlayer);
    
    setSelectedPiece(null);
    setValidMoves([]);
    setPromotionPos(null);
    updateGameStatus(newBoard, currentPlayer);
  }

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(PlayerColor.WHITE);
    setSelectedPiece(null);
    setValidMoves([]);
    setGameState(GameState.IN_PROGRESS);
    setKingInCheckPos(null);
    setPromotionPos(null);
    setCapturedPieces({ WHITE: [], BLACK: [] });
    setAnimationDetails(null);
  };

  const statusMessage = useMemo(() => {
    switch (gameState) {
      case GameState.CHECK:
        return `${currentPlayer}'s turn. ${currentPlayer === PlayerColor.WHITE ? 'Black' : 'White'} King is in Check!`;
      case GameState.CHECKMATE:
        return `Checkmate! ${currentPlayer === PlayerColor.WHITE ? 'Black' : 'White'} wins!`;
      case GameState.STALEMATE:
        return "Stalemate! It's a draw.";
      case GameState.PROMOTION:
        return `Pawn Promotion for ${currentPlayer}! Choose a piece.`;
      default:
        return `${currentPlayer}'s turn.`;
    }
  }, [gameState, currentPlayer]);
  
  const renderCapturedPieces = (color: PlayerColor) => (
    <div className="flex flex-wrap gap-1 min-h-[60px]">
        {capturedPieces[color].map((p, i) => (
            <div key={i} className="w-8 h-8 md:w-10 md:h-10">
                {PIECE_COMPONENTS[p.color][p.type]}
            </div>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-white">
      <div className="flex flex-col lg:flex-row gap-8 items-center">
      
        <div className="w-full lg:w-48 order-2 lg:order-1">
            <h3 className="text-lg font-bold mb-2 text-center text-neutral-300">Captured by White</h3>
            {renderCapturedPieces(PlayerColor.BLACK)}
        </div>

        <div className="flex flex-col items-center order-1 lg:order-2">
            <div className="mb-4 text-center">
              <h1 className="text-4xl font-bold mb-2">React Chess</h1>
              <p className={`text-xl font-semibold ${gameState === GameState.CHECK && 'text-red-400'} ${gameState === GameState.CHECKMATE && 'text-green-400'}`}>{statusMessage}</p>
            </div>
            
            <div className="w-[90vw] h-[90vw] md:w-[70vh] md:h-[70vh] max-w-[800px] max-h-[800px] shadow-2xl rounded-lg overflow-hidden relative">
                {animationDetails?.moving && (
                    <AnimatedPiece
                        piece={animationDetails.moving.piece}
                        from={animationDetails.moving.from}
                        to={animationDetails.moving.to}
                    />
                )}
                {animationDetails?.captured && (
                    <CapturedPiece
                        piece={animationDetails.captured.piece}
                        at={animationDetails.captured.at}
                    />
                )}
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                    {board.flat().map((p, index) => {
                      const row = Math.floor(index / 8);
                      const col = index % 8;
                      const position = { row, col };

                      const isPieceMoving = animationDetails && posEquals(animationDetails.moving.from, position);
                      const isPieceCaptured = animationDetails?.captured && posEquals(animationDetails.captured.at, position);
                      
                      const pieceOnSquare = isPieceMoving || isPieceCaptured ? null : p;

                      return (
                        <Square
                          key={index}
                          piece={pieceOnSquare}
                          position={position}
                          isSelected={posEquals(selectedPiece, position)}
                          isPossibleMove={validMoves.some(move => posEquals(move, position))}
                          isInCheck={posEquals(kingInCheckPos, position)}
                          onClick={handleSquareClick}
                        />
                      );
                    })}
                </div>
                {gameState === GameState.PROMOTION && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center">
                        <div className="flex gap-4 p-4 bg-neutral-700 rounded-lg">
                            {[PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].map(type => (
                                <div key={type} className="w-16 h-16 cursor-pointer hover:bg-neutral-600 p-2 rounded" onClick={() => handlePromotion(type)}>
                                    {PIECE_COMPONENTS[currentPlayer][type]}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {(gameState === GameState.CHECKMATE || gameState === GameState.STALEMATE) && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center">
                        <div className="text-center p-8 bg-neutral-700 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-bold mb-4">{gameState === GameState.CHECKMATE ? `Checkmate!` : 'Stalemate!'}</h2>
                            <p className="text-lg mb-6">{gameState === GameState.CHECKMATE ? `${currentPlayer === PlayerColor.WHITE ? 'Black' : 'White'} wins!` : `It's a draw.`}</p>
                            <button onClick={resetGame} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">
                                Play Again
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <button onClick={resetGame} className="mt-6 px-8 py-3 bg-neutral-600 hover:bg-neutral-700 rounded-lg font-semibold transition-colors text-lg">
                New Game
            </button>
        </div>
        
        <div className="w-full lg:w-48 order-3 lg:order-3">
             <h3 className="text-lg font-bold mb-2 text-center text-neutral-300">Captured by Black</h3>
            {renderCapturedPieces(PlayerColor.WHITE)}
        </div>

      </div>
    </div>
  );
};

export default App;
