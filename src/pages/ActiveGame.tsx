import { convertFromFen } from 'crochess-api/dist/utils/fen';
import {
  convertIdxToSquare,
  convertSquareToIdx,
} from 'crochess-api/dist/utils/square';
import {
  Reducer,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import Gameboard from '../components/Game/Gameboard';
import Interface from '../components/Game/Interface/Interface';

import { Game, getChecks, getLegalMoves, isPromote } from 'crochess-api';
import { GameState as FenState } from 'crochess-api/dist/types/interfaces';
import {
  AllPieceMap,
  Board,
  Colors,
  Enumerate,
  PromotePieceType,
  Square,
} from 'crochess-api/dist/types/types';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import {
  buildPieceMap,
  getEmptyPieceMap,
} from 'crochess-api/dist/utils/pieceMap';
import { useParams } from 'react-router-dom';
import styles from '../styles/ActiveGame.module.scss';
import {
  GameOverGameState,
  GameSchema,
  GameStateClient,
  GameStateSchema,
} from '../types/interfaces';
import {
  AllTimes,
  HistoryArr,
  Move,
  ReducerActions,
  TimeDetails,
} from '../types/types';
import { UserContext } from '../utils/contexts/UserContext';
import { sendMove } from '../utils/game';
import { getActivePlayer, parseCookies } from '../utils/misc';
import { DrawRecord } from '@backend/types';

function getBoardStates(moves: Move[]): Board[] {
  let game = new Game();

  return moves.length === 0
    ? [game.board]
    : moves.map((move) => {
        const from = move.slice(0, 2) as Square;
        const to = move.slice(2, 4) as Square;
        const promote = move[5] as PromotePieceType | undefined;
        game.makeMove(from, to, promote);

        return [...game.board];
      });
}

export default function ActiveGame() {
  const mounted = useRef(false);

  const { socket } = useContext(UserContext);

  const maxTimeRef = useRef<number>(0);
  const timeDetailsRef = useRef<TimeDetails>({
    w: {
      timeLeftAtTurnStart: 0,
      stampAtTurnStart: 0,
    },
    b: {
      timeLeftAtTurnStart: 0,
      stampAtTurnStart: 0,
    },
  });

  const [gameboardView, setGameboardView] = useState<Colors>('w');

  const reducer: Reducer<GameStateClient, ReducerActions> = (
    state: GameStateClient,
    action: ReducerActions
  ): GameStateClient => {
    switch (action.type) {
      case 'init': {
        return action.payload;
      }
      case 'game over':
      case 'update on move': {
        return { ...state, ...action.payload };
      }
      case 'update draw': {
        return { ...state, drawRecord: action.payload };
      }
      case 'update time': {
        return {
          ...state,
          time: {
            [action.payload.color]: action.payload.time,
            [OPP_COLOR[action.payload.color]]:
              state.time[OPP_COLOR[action.payload.color]],
          } as Record<Colors, number>,
        };
      }
      default:
        return state;
    }
  };
  const [gameState, dispatch] = useReducer(reducer, {
    time: { w: null, b: null },
    activeColor: 'w',
    history: [] as HistoryArr,
    moves: [] as string[],
    drawRecord: { w: false, b: false },
    gameOverDetails: {
      result: null,
      winner: null,
    },
    castleRights: {
      w: {
        k: false,
        q: false,
      },
      b: {
        k: false,
        q: false,
      },
    },
    enPassant: null,
    board: Array(120),
  } as GameStateClient);
  const activePlayerRef = useRef<Colors | null>(null);
  const boardStates = useMemo(() => {
    return getBoardStates(gameState.moves);
  }, [gameState.moves]);
  const [boardBeingViewed, setBoardBeingViewed] =
    useState<Enumerate<typeof gameState.moves.length>>(0);
  const [squareToMove, setSquareToMove] = useState<Square | null>(null);
  const { gameId } = useParams();

  useEffect(function setMounted() {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  function parseHistory(history: string): HistoryArr {
    return history === ''
      ? []
      : history.split(' ').reduce(function parseIntoPairs(acc, curr, i) {
          if (i % 2 === 0) {
            acc.push([curr, '']);
          } else acc[acc.length - 1][1] = curr;

          return acc;
        }, [] as HistoryArr);
  }

  useEffect(
    function onFirstLoad() {
      socket?.unsubscribe('/topic/api/gameseeks');
      const subscription = socket?.subscribe(
        `/app/api/game/${gameId}`,
        () => {}
      );
      return () => {
        subscription?.unsubscribe();
      };
    },
    [socket, gameId]
  );

  useEffect(
    function subscribeToGame() {
      if (!socket) return;
      const subscription = socket.subscribe(
        `/topic/api/game/${gameId}`,
        (message) => {
          interface Init {
            event: 'init';
            payload: GameSchema;
          }
          interface UpdateOnGameOver {
            event: 'game over';
            payload: GameOverGameState;
          }
          interface UpdateOnMove {
            event: 'update';
            payload: GameStateSchema;
          }
          interface UpdateDraw {
            event: 'update draw';
            payload: DrawRecord;
          }
          type Message = Init | UpdateOnMove | UpdateOnGameOver | UpdateDraw;
          console.log(message.body);
          if (!message.body) return;
          const data = JSON.parse(message.body) as Message;
          switch (data.event) {
            case 'init': {
              const game: GameSchema = JSON.parse(message.body).payload;
              const boardState = convertFromFen(game.fen) as FenState;
              if (!game.result) {
                timeDetailsRef.current[boardState.activeColor] = {
                  timeLeftAtTurnStart: game[`${boardState.activeColor}_time`],
                  // if server has stamp use that one, otherwise initiate one
                  stampAtTurnStart: game.time_stamp_at_turn_start || Date.now(),
                };
              }

              maxTimeRef.current = game.time;
              activePlayerRef.current = getActivePlayer(
                gameId!,
                game.w_id,
                game.b_id
              );
              const history = game.history?.split(' ');
              setBoardBeingViewed(history ? history.length - 1 : 0);
              setGameboardView(() => activePlayerRef.current || 'w');

              let time: AllTimes = { w: 0, b: 0 };
              if (game.time_stamp_at_turn_start) {
                // if fetch happens in middle of game
                const elapsedTime = Date.now() - game.time_stamp_at_turn_start;
                let timeLeft =
                  game[`${boardState.activeColor}_time`] - elapsedTime;
                if (timeLeft < 0) timeLeft = 0;

                time = {
                  [boardState.activeColor]: timeLeft,
                  [OPP_COLOR[boardState.activeColor]]:
                    game[`${OPP_COLOR[boardState.activeColor]}_time`],
                } as AllTimes;
              } else {
                time = {
                  w: game.w_time,
                  b: game.b_time,
                };
              }

              const moves = game.moves || '';
              dispatch({
                type: 'init',
                payload: {
                  time,
                  board: boardState.board,
                  activeColor: boardState.activeColor,
                  drawRecord: game.drawRecord,
                  history: parseHistory(game.history || ''),
                  moves: moves.split(' ') as Move[],
                  enPassant: boardState.enPassant,
                  castleRights: boardState.castleRights,
                  gameOverDetails: {
                    winner: game.winner,
                    result: game.result,
                  },
                },
              });
              break;
            }
            case 'game over':
            case 'update': {
              const gameState = data.payload;
              const boardState = convertFromFen(gameState.fen) as FenState;

              const elapsedTime =
                Date.now() - gameState.time_stamp_at_turn_start;
              let timeLeft =
                gameState[`${boardState.activeColor}_time`] - elapsedTime;
              if (timeLeft < 0) timeLeft = 0;

              const time = {
                [boardState.activeColor]: timeLeft,
                [OPP_COLOR[boardState.activeColor]]:
                  gameState[`${OPP_COLOR[boardState.activeColor]}_time`],
              } as AllTimes;

              const moves = gameState.moves.split(' ') as Move[];
              setBoardBeingViewed((prev) => {
                if (prev === moves.length - 2) return moves.length - 1;
                else return prev;
              });

              if (data.event === 'game over') {
                const gs = data.payload;
                console.log(gs);

                dispatch({
                  type: data.event,
                  payload: {
                    time,
                    activeColor: boardState.activeColor,
                    history: parseHistory(gameState.history || ''),
                    moves: moves,
                    enPassant: boardState.enPassant,
                    castleRights: boardState.castleRights,
                    board: boardState.board,
                    gameOverDetails: {
                      result: gs.result,
                      winner: gs.winner,
                    },
                  },
                });
              }

              dispatch({
                type: 'update on move',
                payload: {
                  time,
                  activeColor: boardState.activeColor,
                  history: parseHistory(gameState.history || ''),
                  moves: moves,
                  enPassant: boardState.enPassant,
                  castleRights: boardState.castleRights,
                  board: boardState.board,
                },
              });
              break;
            }

            case 'update draw': {
              dispatch({
                type: 'update draw',
                payload: data.payload,
              });
            }
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    },
    [socket, gameId]
  );

  const pieceMap = useMemo(() => {
    return gameState.board
      ? buildPieceMap(gameState.board)
      : getEmptyPieceMap();
  }, [gameState.board]);

  const checks = useMemo(() => {
    if (gameState.activeColor !== activePlayerRef.current) return [];
    return getChecks(
      OPP_COLOR[gameState.activeColor],
      pieceMap[gameState.activeColor].k[0],
      gameState.board as Board
    );
  }, [gameState.activeColor, pieceMap, gameState.board]);

  const getMoves = useCallback(
    (square: Square) => {
      return getLegalMoves(
        square,
        {
          board: gameState.board,
          castleRights: gameState.castleRights,
          enPassant: gameState.enPassant,
          activeColor: gameState.activeColor,
        },
        pieceMap,
        checks
      )?.map((idx) => convertIdxToSquare(idx));
    },
    [
      checks,
      gameState.board,
      gameState.castleRights,
      gameState.enPassant,
      pieceMap,
      gameState.activeColor,
    ]
  );

  const validateMove = useCallback(
    (square: Square): boolean => {
      if (!gameState.board || !squareToMove) return false;
      if (activePlayerRef.current !== gameState.activeColor) return false;

      const piece = gameState.board[convertSquareToIdx(squareToMove)];
      if (!piece) return false;
      if (piece[0] !== gameState.activeColor) return false;
      const sIdx = convertSquareToIdx(square);
      if (
        // returns null if there is no piece
        getLegalMoves(
          squareToMove,
          {
            board: gameState.board,
            castleRights: gameState.castleRights,
            enPassant: gameState.enPassant,
            activeColor: gameState.activeColor,
          },
          pieceMap as AllPieceMap,
          checks
        )?.every((s) => s !== sIdx)
      )
        return false;

      return true;
    },
    [
      checks,
      gameState.activeColor,
      gameState.board,
      gameState.castleRights,
      gameState.enPassant,
      pieceMap,
      squareToMove,
    ]
  );

  const checkPromotion = useCallback(
    (square: Square) => {
      if (!squareToMove) return false;
      const piece = gameState.board[convertSquareToIdx(squareToMove)];
      if (!piece) return false;
      return isPromote(piece, square);
    },
    [gameState.board, squareToMove]
  );

  const makeMove = useCallback(
    async (to: Square, promote: PromotePieceType | '' = '') => {
      // cant make move if player is viewing past positions
      if (boardBeingViewed !== gameState.moves.length - 1) return;
      if (!squareToMove) return;

      const valid = validateMove(to);
      if (!valid) return;
      if (promote && !checkPromotion(to)) return;
      // get the playerId from cookie so players can play from multiple tabs
      const cookieObj = parseCookies(document.cookie);
      const playerId = cookieObj[`${gameId}(${activePlayerRef.current})`];
      try {
        sendMove(
          socket!,
          gameId as string,
          playerId,
          `${squareToMove}${to}${promote}`
        );
      } catch (err) {
        console.log(err);
      }
    },
    [
      socket,
      gameId,
      validateMove,
      checkPromotion,
      squareToMove,
      boardBeingViewed,
      gameState.moves.length,
    ]
  );

  const moveListControls = useMemo(() => {
    return {
      goBackToStart: () => {
        if (!gameState.moves.length) return;
        setBoardBeingViewed(0);
      },
      goBackOneMove: () => {
        if (!gameState.moves.length) return;
        setBoardBeingViewed((prev) => {
          if (prev === 0) return prev;
          return prev - 1;
        });
      },
      goForwardOneMove: () => {
        if (!gameState.moves.length) return;
        setBoardBeingViewed((prev) => {
          if (prev === gameState.moves.length - 1) return prev;
          return prev + 1;
        });
      },
      goToCurrentMove: () => {
        if (!gameState.moves.length) return;
        setBoardBeingViewed(gameState.moves.length - 1);
      },
    };
  }, [gameState.moves.length]);

  const flipBoard = useCallback(() => {
    setGameboardView((prev) => {
      return OPP_COLOR[prev];
    });
  }, []);

  function updateTime(color: Colors, time: number) {
    dispatch({
      type: 'update time',
      payload: { color, time },
    });
  }
  return (
    <main className={styles.main}>
      <div className={styles['game-contents']}>
        <Gameboard
          view={gameboardView}
          board={boardStates[boardBeingViewed]}
          makeMove={makeMove}
          squareToMove={squareToMove}
          setSquareToMove={setSquareToMove}
          getLegalMoves={getMoves}
          activePlayer={activePlayerRef.current}
          validateMove={validateMove}
        />
        <Interface
          activePlayer={activePlayerRef.current}
          claimDraw={
            !!activePlayerRef.current &&
            gameState.drawRecord[activePlayerRef.current]
          }
          offeredDraw={
            !!activePlayerRef.current &&
            !gameState.drawRecord[activePlayerRef.current] &&
            gameState.drawRecord[OPP_COLOR[activePlayerRef.current]]
          }
          gameOverDetails={gameState.gameOverDetails}
          whiteDetails={{
            maxTime: maxTimeRef.current,
            timeStampAtStart: timeDetailsRef.current.w.stampAtTurnStart,
            timeLeftAtStart: timeDetailsRef.current.w.timeLeftAtTurnStart,
            time: gameState.time.w,
            setTime: (time: number) => updateTime('w', time),
            active:
              !gameState.gameOverDetails.result &&
              gameState.activeColor === 'w',
          }}
          blackDetails={{
            maxTime: maxTimeRef.current,
            timeStampAtStart: timeDetailsRef.current.b.stampAtTurnStart,
            timeLeftAtStart: timeDetailsRef.current.b.timeLeftAtTurnStart,
            time: gameState.time.b,
            setTime: (time: number) => updateTime('b', time),
            active:
              !gameState.gameOverDetails.result &&
              gameState.activeColor === 'b',
          }}
          history={gameState.history}
          historyControls={moveListControls}
          view={gameboardView}
          flipBoard={flipBoard}
        />
      </div>
    </main>
  );
}
