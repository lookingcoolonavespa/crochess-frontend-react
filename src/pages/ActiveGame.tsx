import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useReducer,
  Reducer,
  useContext,
} from 'react';
import Gameboard from '../components/Game/Gameboard';
import Interface from '../components/Game/Interface/Interface';
import {
  convertIdxToSquare,
  convertSquareToIdx,
} from 'crochess-api/dist/utils/square';
import { convertFromFen } from 'crochess-api/dist/utils/fen';
import { isFenStr } from 'crochess-api/dist/utils/typeCheck';

import {
  Colors,
  Board,
  Square,
  MoveNotationList,
  FenStr,
  Enumerate,
  AllPieceMap,
  PromotePieceType,
  Tuple,
} from 'crochess-api/dist/types/types';
import { parseCookies } from '../utils/misc';
import styles from '../styles/ActiveGame.module.scss';
import { fetchGame, sendMove } from '../utils/game';
import {
  GameSchema,
  GameStateClient,
  GameStateSchema,
} from '../types/interfaces';
import { ReducerActions, AllTimes, HistoryArr } from '../types/types';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { TimeDetails } from '../types/types';
import { getActivePlayer } from '../utils/misc';
import { GameState as FenState } from 'crochess-api/dist/types/interfaces';
import { getLegalMoves, getChecks, isPromote } from 'crochess-api';
import {
  buildPieceMap,
  getEmptyPieceMap,
} from 'crochess-api/dist/utils/pieceMap';
import { useParams } from 'react-router-dom';
import { UserContext } from '../utils/contexts/UserContext';

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
      case 'update on move': {
        return { ...state, ...action.payload };
      }
      case 'update draw': {
        return { ...state, drawRecord: action.payload };
      }
      case 'update time': {
        return {
          ...gameState,
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
    drawRecord: { w: false, b: false },
    gameOverDetails: null,
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
  const movesRef = useRef<MoveNotationList>([]);
  const [historyIdx, setHistoryIdx] =
    useState<Enumerate<typeof movesRef.current.length>>(0);
  const [squareToMove, setSquareToMove] = useState<Square | null>(null);

  const { gameId } = useParams();

  useEffect(function setMounted() {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  function parseHistory(history: string): HistoryArr {
    return history.split(' ').reduce(function parseIntoPairs(acc, curr, i) {
      if (i % 2 !== 0) {
        acc.push([curr, '']);
      } else acc[acc.length - 1][1] = curr;

      return acc;
    }, [] as HistoryArr);
  }

  useEffect(
    function onFirstLoad() {
      socket?.subscribe(`/app/api/game/${gameId}`, (message) => {
        const game: GameSchema = JSON.parse(message.body);
        const gameState = game.gameState;

        const boardState = convertFromFen(gameState.fen) as FenState;

        if (!game.result) {
          timeDetailsRef.current[boardState.activeColor] = {
            timeLeftAtTurnStart: gameState[`${boardState.activeColor}_time`],
            // if server has stamp use that one, otherwise initiate one
            stampAtTurnStart: gameState.time_stamp_at_turn_start || Date.now(),
          };
        }

        maxTimeRef.current = game.time;
        activePlayerRef.current = getActivePlayer(
          gameId!,
          game.w_id,
          game.b_id
        );
        movesRef.current = gameState.moves.split(' ');
        setHistoryIdx(gameState.history.length - 1);
        setGameboardView(() => activePlayerRef.current || 'w');

        let time: AllTimes = { w: 0, b: 0 };
        if (gameState.time_stamp_at_turn_start) {
          // if fetch happens in middle of game
          const elapsedTime = Date.now() - gameState.time_stamp_at_turn_start;
          let timeLeft =
            gameState[`${boardState.activeColor}_time`] - elapsedTime;
          if (timeLeft < 0) timeLeft = 0;

          time = {
            [boardState.activeColor]: timeLeft,
            [OPP_COLOR[boardState.activeColor]]:
              gameState[`${OPP_COLOR[boardState.activeColor]}_time`],
          } as AllTimes;
        } else {
          time = {
            w: gameState.w_time,
            b: gameState.b_time,
          };
        }

        dispatch({
          type: 'init',
          payload: {
            time,
            board: boardState.board,
            activeColor: boardState.activeColor,
            drawRecord: game.drawRecord,
            history: parseHistory(gameState.history),
            enPassant: boardState.enPassant,
            castleRights: boardState.castleRights,
            gameOverDetails: game.result
              ? {
                  winner: game.winner,
                  reason: game.result,
                }
              : null,
          },
        });
      });
    },
    [socket, gameId]
  );

  useEffect(
    function subscribeToGame() {
      if (!socket) return;
      const subscription = socket.subscribe(
        `/topics/api/game/${gameId}`,
        (message) => {
          const data = JSON.parse(message.body);

          switch (data.event) {
            case 'update': {
              const gameState = data.payload as GameStateSchema;
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

              movesRef.current = gameState.moves.split(' ');
              setHistoryIdx((prev) => {
                if (prev === movesRef.current.length - 2)
                  return movesRef.current.length - 1;
                else return prev;
              });

              dispatch({
                type: 'update on move',
                payload: {
                  time,
                  activeColor: boardState.activeColor,
                  history: parseHistory(gameState.history),
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
                payload: data,
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
    (square: Square) => {
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
      if (historyIdx !== movesRef.current.length - 1) return;
      if (!squareToMove) return;

      const valid = validateMove(to);
      if (!valid) return;
      if (promote && !checkPromotion(to)) return;

      const cookieObj = parseCookies(document.cookie);
      const playerId = cookieObj[`${gameId}(${activePlayerRef.current})`];
      try {
        await sendMove(
          gameId as string,
          playerId,
          `${squareToMove}${to}${promote}`
        );
      } catch (err) {
        console.log(err);
      }
    },
    [gameId, validateMove, checkPromotion, squareToMove, historyIdx]
  );

  const moveListControls = useMemo(() => {
    return {
      goBackToStart: () => {
        if (!movesRef.current.length) return;
        setHistoryIdx(0);
      },
      goBackOneMove: () => {
        if (!movesRef.current.length) return;
        setHistoryIdx((prev) => {
          if (prev === 0) return prev;
          return prev - 1;
        });
      },
      goForwardOneMove: () => {
        if (!movesRef.current.length) return;
        setHistoryIdx((prev) => {
          if (prev === movesRef.current.length - 1) return prev;
          return prev + 1;
        });
      },
      goToCurrentMove: () => {
        if (!movesRef.current.length) return;
        setHistoryIdx(movesRef.current.length - 1);
      },
    };
  }, []);

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

  const boardBeingViewed = useMemo(() => {
    if (movesRef.current.length)
      return convertFromFen(movesRef.current[historyIdx])?.board;
  }, [historyIdx, gameState]);

  return (
    <main className={styles.main}>
      <div className={styles['game-contents']}>
        <Gameboard
          view={gameboardView}
          board={boardBeingViewed as Board}
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
            active: !gameState.gameOverDetails && gameState.activeColor === 'w',
          }}
          blackDetails={{
            maxTime: maxTimeRef.current,
            timeStampAtStart: timeDetailsRef.current.b.stampAtTurnStart,
            timeLeftAtStart: timeDetailsRef.current.b.timeLeftAtTurnStart,
            time: gameState.time.b,
            setTime: (time: number) => updateTime('b', time),
            active: !gameState.gameOverDetails && gameState.activeColor === 'b',
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
