import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useReducer,
  Reducer,
  MouseEvent,
} from 'react';
import Gameboard from '../components/Game/Gameboard';
import Interface from '../components/Game/Interface';
import { io } from 'socket.io-client';
import {
  convertIdxToSquare,
  convertSquareToIdx,
} from 'crochess-api/dist/utils/square';
import { convertFromFen } from 'crochess-api/dist/utils/fen';
import { isFenStr } from 'crochess-api/dist/utils/typeCheck';

import {
  CastleRights,
  Colors,
  Board,
  PieceType,
  Square,
  SquareIdx,
  MoveNotationList,
  FenStr,
  Enumerate,
  AllPieceMap,
  PromotePieceType,
} from 'crochess-api/dist/types/types';
import { convertPieceMapToArray, parseCookies } from '../utils/misc';
import styles from '../styles/ActiveGame.module.scss';
import { fetchGame, sendMove } from '../utils/game';
import {
  FetchedGameInterface,
  GameState,
  UpdatedGameInterface,
} from '../types/interfaces';
import { ReducerActions, AllTimes } from '../types/types';
import { formatTime } from '../utils/timerStuff';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { ClaimDrawRecord, GameOverDetails, TimeDetails } from '../types/types';
import { getActivePlayer } from '../utils/misc';
import { GameState as FenState } from 'crochess-api/dist/types/interfaces';
import getLegalMoves, {
  getChecks,
  isPromote,
} from 'crochess-api/dist/utils/getLegalMoves';
import { buildPieceMap, getEmptyPieceMap } from 'crochess-api/dist/utils/board';

export default function ActiveGame() {
  const mounted = useRef(false);

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

  const reducer: Reducer<GameState, ReducerActions> = (
    state: GameState,
    action: ReducerActions
  ): GameState => {
    switch (action.type) {
      case 'update on load/move': {
        return action.payload;
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
    }

    return state;
  };
  const [gameState, dispatch] = useReducer(reducer, {
    time: { w: null, b: null },
    activeColor: 'w',
    moveList: [] as MoveNotationList,
    claimDrawRecord: { w: false, b: false },
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
    enPassant: '-',
  } as GameState);
  const activePlayerRef = useRef<Colors | null>(null);
  const historyRef = useRef<FenStr[]>([]);
  const [historyIdx, setHistoryIdx] =
    useState<Enumerate<typeof historyRef.current.length>>(0);
  const [pieceToMove, setPieceToMove] = useState<Square | null>(null);

  const router = useRouter();
  const { activeGameId: gameId } = router.query;

  useEffect(function setMounted() {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(
    function onFirstLoad() {
      (async () => {
        if (!gameId) return;
        const game: FetchedGameInterface = await fetchGame(gameId as string);
        if (!isFenStr(game.state.fen)) throw new Error('invalid game');

        const boardState = convertFromFen(game.state.fen) as FenState;

        if (game.state.active) {
          timeDetailsRef.current[boardState.activeColor] = {
            timeLeftAtTurnStart: game.state[`${boardState.activeColor}Time`],
            // if server has stamp use that one, otherwise initiate one
            stampAtTurnStart: game.state.turnStart || Date.now(),
          };
        }

        maxTimeRef.current = game.time;
        activePlayerRef.current = getActivePlayer(gameId, game.wId, game.bId);
        historyRef.current = game.history;
        setGameboardView(() => activePlayerRef.current || 'w');

        let time: AllTimes = { w: 0, b: 0 };
        if (game.state.turnStart) {
          // if fetch happens in middle of game
          const elapsedTime = Date.now() - game.state.turnStart;
          let timeLeft =
            game.state[`${boardState.activeColor}Time`] - elapsedTime;
          if (timeLeft < 0) timeLeft = 0;

          time = {
            [boardState.activeColor]: timeLeft,
            [OPP_COLOR[boardState.activeColor]]:
              game.state[`${OPP_COLOR[boardState.activeColor]}Time`],
          } as AllTimes;
        } else {
          time = {
            w: game.state.wTime,
            b: game.state.bTime,
          };
        }

        dispatch({
          type: 'update on load/move',
          payload: {
            time,
            board: boardState.board,
            activeColor: boardState.activeColor,
            claimDrawRecord: game.claimDrawRecord,
            moveList: game.state.moveList,
            enPassant: boardState.enPassant,
            castleRights: boardState.castleRights,
            gameOverDetails: game.winner
              ? {
                  winner: game.winner,
                  reason: game.causeOfDeath,
                }
              : null,
          },
        });
      })();
    },
    [gameId]
  );

  useEffect(
    function connectToSocket() {
      const socket = io(`${process.env.NEXT_PUBLIC_URL_BACKEND}/games`);

      if (gameId) socket.emit('joinRoom', gameId);

      socket.on('update', (game: UpdatedGameInterface) => {
        if (!isFenStr(game.fen)) throw new Error('game is invalid');

        const boardState = convertFromFen(game.fen) as FenState;

        if (game.active) {
          timeDetailsRef.current[boardState.activeColor] = {
            timeLeftAtTurnStart: game[`${boardState.activeColor}Time`],
            stampAtTurnStart: game.turnStart,
          };
          timeDetailsRef.current[OPP_COLOR[boardState.activeColor]] = {
            // need to reset to 0 so Timer doesnt use the old values when turn changes
            timeLeftAtTurnStart: 0,
            stampAtTurnStart: 0,
          };
        }

        const elapsedTime = Date.now() - game.turnStart;
        let timeLeft = game[`${boardState.activeColor}Time`] - elapsedTime;
        if (timeLeft < 0) timeLeft = 0;

        const time = {
          [boardState.activeColor]: timeLeft,
          [OPP_COLOR[boardState.activeColor]]:
            game[`${OPP_COLOR[boardState.activeColor]}Time`],
        } as AllTimes;

        historyRef.current.push(game.fen);
        setHistoryIdx((prev) => {
          if (prev === historyRef.current.length - 2)
            return historyRef.current.length - 1;
          else return prev;
        });

        dispatch({
          type: 'update on load/move',
          payload: {
            time,
            activeColor: boardState.activeColor,
            claimDrawRecord: game.claimDrawRecord || { w: false, b: false },
            moveList: game.moveList,
            enPassant: boardState.enPassant,
            castleRights: boardState.castleRights,
            gameOverDetails: !game.active ? game.gameOverDetails : null,
            board: boardState.board,
          },
        });
      });
    },
    [gameId]
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
    ]
  );

  const validateMove = useCallback(
    (square: Square) => {
      if (!gameState.board || !pieceToMove) return false;
      if (activePlayerRef.current !== gameState.activeColor) return false;

      const piece = gameState.board[convertSquareToIdx(pieceToMove)];
      if (!piece) return false;
      if (piece[0] !== gameState.activeColor) return false;
      const sIdx = convertSquareToIdx(square);
      if (
        // returns null if there is no piece
        getLegalMoves(
          pieceToMove,
          {
            board: gameState.board,
            castleRights: gameState.castleRights,
            enPassant: gameState.enPassant,
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
      pieceToMove,
    ]
  );

  const checkPromotion = useCallback(
    (square: Square) => {
      if (!pieceToMove) return false;
      const piece = gameState.board[convertSquareToIdx(pieceToMove)];
      if (!piece) return false;
      return isPromote(piece, square);
    },
    [gameState.board, pieceToMove]
  );

  const makeMove = useCallback(
    async (to: Square, promote: PromotePieceType | '' = '') => {
      // cant make move if player is viewing past positions
      if (historyIdx !== historyRef.current.length - 1) return;
      if (!pieceToMove) return;

      const valid = validateMove(to);
      if (!valid) return;
      if (promote && !checkPromotion(to)) return;

      const cookieObj = parseCookies(document.cookie);
      const playerId = cookieObj[`${gameId}(${activePlayerRef.current})`];
      try {
        await sendMove(gameId as string, playerId, pieceToMove, to, promote);
      } catch (err) {
        console.log(err);
      }
    },
    [gameId, validateMove, checkPromotion, pieceToMove, historyIdx]
  );

  const historyControls = useMemo(() => {
    return {
      goBackToStart: () => {
        if (!historyRef.current.length) return;
        setHistoryIdx(0);
      },
      goBackOneMove: () => {
        if (!historyRef.current.length) return;
        setHistoryIdx((prev) => {
          if (prev === 0) return prev;
          return prev - 1;
        });
      },
      goForwardOneMove: () => {
        if (!historyRef.current.length) return;
        setHistoryIdx((prev) => {
          if (prev === historyRef.current.length - 1) return prev;
          return prev + 1;
        });
      },
      goToCurrentMove: () => {
        if (!historyRef.current.length) return;
        setHistoryIdx(historyRef.current.length - 1);
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

  return (
    <main className={styles.main}>
      <div className={styles['game-contents']}>
        <Gameboard
          view={gameboardView}
          board={gameState.board}
          makeMove={makeMove}
          pieceToMove={pieceToMove}
          setPieceToMove={setPieceToMove}
          getLegalMoves={getMoves}
          activePlayer={activePlayerRef.current}
          validateMove={validateMove}
        />
        <Interface
          activePlayer={activePlayerRef.current}
          claimDraw={
            !!activePlayerRef.current &&
            gameState.claimDrawRecord[activePlayerRef.current]
          }
          offeredDraw={
            !!activePlayerRef.current &&
            !gameState.claimDrawRecord[activePlayerRef.current] &&
            gameState.claimDrawRecord[OPP_COLOR[activePlayerRef.current]]
          }
          gameOverDetails={gameState.gameOverDetails}
          whiteDetails={{
            maxTime: maxTimeRef.current,
            timeStampAtStart: timeDetailsRef.current.w.stampAtTurnStart,
            time: gameState.time.w,
            setTime: (time: number) => updateTime('w', time),
            active: !gameState.gameOverDetails && gameState.activeColor === 'w',
          }}
          blackDetails={{
            maxTime: maxTimeRef.current,
            timeStampAtStart: timeDetailsRef.current.b.stampAtTurnStart,
            time: gameState.time.b,
            setTime: (time: number) => updateTime('b', time),
            active: !gameState.gameOverDetails && gameState.activeColor === 'b',
          }}
          turnStart={timeDetailsRef.current[turn].turnStart}
          history={moveHistory}
          historyControls={historyControls}
          view={gameboardView}
          flipBoard={flipBoard}
        />
      </div>
    </main>
  );
}
