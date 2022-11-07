import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Reducer,
} from 'react';
import Gameboard from '../components/Game/Gameboard';
import Interface from '../components/Game/Interface';
import { io } from 'socket.io-client';
import { Game } from 'crochess-api';
import {
  convertIdxToSquare,
  convertSquareToIdx,
} from 'crochess-api/dist/utils/square';
import {
  CastleRights,
  Colors,
  Board,
  PieceType,
  Square,
  SquareIdx,
  MoveNotationList,
  FenStr,
} from 'crochess-api/dist/types/types';
import { convertPieceMapToArray, parseCookies } from '../utils/misc';
import styles from '../styles/ActiveGame.module.scss';
import { fetchGame, sendMove } from '../utils/game';
import updateGameDetails from '../utils/updateGameDetails';
import { GameInterface, GameState } from '../types/interfaces';
import { ReducerActions } from '../types/types';
import { formatTime } from '../utils/timerStuff';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';
import { useReducer } from 'react';
import { ClaimDrawRecord, GameOverDetails, TimeDetails } from '../types/types';

const game = new Game();

export default function ActiveGame() {
  const mounted = useRef(false);

  const maxTime = useRef<number>(0);
  const timeDetailsRef = useRef<TimeDetails>({
    w: {
      timeAtTurnStart: 0,
      stampAtTurnStart: 0,
    },
    b: {
      timeAtTurnStart: 0,
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
  const [gameState, setGameState] = useReducer(reducer, {
    time: { w: null, b: null },
    turn: 'w',
    fen: '',
    moveList: [],
    ClaimDrawRecord: { w: false, b: false },
    gameOver: null,
  });

  const activePlayerRef = useRef<Colors | null>(null);

  const [pieceToMove, setPieceToMove] = useState<Square | null>(null);
  const [promotePopupSquare, setPromotePopupSquare] = useState<Square | null>(
    null
  );

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
        const game: GameInterface = await fetchGame(gameId as string);

        if (game.active) {
          timeDetailsRef.current[game.turn] = {
            timeAtTurnStart: game[game.turn].timeLeft,
            // if server has stamp use that one, otherwise initiate one
            stampAtTurnStart: game.turnStart || Date.now(),
          };
        }

        maxTime.current = game.time;

        activePlayerRef.current = getActivePlayer(
          gameId,
          game.w.player,
          game.b.player
        );
        setGameboardView(() => activePlayerRef.current || 'w');

        let time: AllTimes = { w: 0, b: 0 };
        if (game.turnStart) {
          // if fetch happens in middle of game
          const elapsedTime = Date.now() - game.turnStart;
          let timeLeft = game[game.turn].timeLeft - elapsedTime;
          if (timeLeft < 0) timeLeft = 0;

          time = {
            [game.turn]: timeLeft,
            [OPP_COLOR[game.turn]]: game[OPP_COLOR[game.turn]].timeLeft,
          } as AllTimes;
        } else {
          time = {
            w: game.w.timeLeft,
            b: game.b.timeLeft,
          };
        }

        setGameState({
          type: 'up',
        });
        if (!game.active) {
          // needs to be last state set otherwise the display wont popup
          setGameOverDetails({
            winner: game.winner,
            reason: game.causeOfDeath,
          });
        }
      })();
    },
    [gameId]
  );

  useEffect(
    function connectToSocket() {
      const socket = io(`${process.env.NEXT_PUBLIC_URL_BACKEND}/games`);

      if (gameId) socket.emit('joinRoom', gameId);

      socket.on('update', (data) => {
        updateGameDetails.onUpdate(
          data,
          { timeDetailsRef, pieceMapsRef },
          {
            setGameOverDetails,
            setBoardState,
            setMoveHistory,
            setWhiteTime,
            setBlackTime,
            setCurrentPieceMapIdx,
            setTurn,
            setClaimDrawRecord,
          }
        );
      });
    },
    [gameId]
  );

  const gameboard = useMemo(
    () => Board(boardState.board, boardState.checks, boardState.castleRights),
    [boardState]
  );

  const validateMove = useCallback(
    (square: Square) => {
      if (gameOverDetails) return false;
      if (!boardState || !pieceToMove) return false;
      if (currentPieceMapIdx !== pieceMapsRef.current.length - 1) return false;

      if (gameboard.at(pieceToMove).piece?.color !== activePlayerRef.current)
        return false;
      if (!gameboard.validate.move(pieceToMove, square)) return false;
      if (activePlayerRef.current !== turn) return false;

      return true;
    },
    [
      gameboard,
      boardState,
      currentPieceMapIdx,
      gameOverDetails,
      pieceToMove,
      turn,
    ]
  );

  const checkPromotion = useCallback(
    (square: Square) => {
      return gameboard.validate.promotion(pieceToMove as string, square);
    },
    [gameboard.validate, pieceToMove]
  );

  const makeMove = useCallback(
    async (to: Square, promote: PieceType | '' = '') => {
      if (currentPieceMapIdx !== pieceMapsRef.current.length - 1) return;
      if (!pieceToMove) return;

      const valid = validateMove(to);
      if (!valid) return;
      if (promote && !checkPromotion(to)) return;

      updatePieceMaps();
      setTurn((prev) => getOppColor(prev)); // changing turn here feels faster

      const cookieObj = parseCookies(document.cookie);
      const playerId = cookieObj[`${gameId}(${activePlayerRef.current})`];
      try {
        await sendMove(gameId as string, playerId, pieceToMove, to, promote);
      } catch (err) {
        console.log(err);
        revertMove();
      }

      function updatePieceMaps() {
        const gameboard = Board(new Map(boardState.board));
        gameboard.from(pieceToMove as string).to(to);
        if (promote) gameboard.at(pieceToMove as string).promote(promote);
        pieceMapsRef.current.push(gameboard.get.pieceMap());
        setCurrentPieceMapIdx(pieceMapsRef.current.length - 1);
      }

      function revertMove() {
        setTurn((prev) => getOppColor(prev));
        setCurrentPieceMapIdx(pieceMapsRef.current.length - 1);
        pieceMapsRef.current.pop();
      }
    },
    [
      gameId,
      boardState,
      validateMove,
      checkPromotion,
      pieceToMove,
      currentPieceMapIdx,
    ]
  );

  const getLegalMoves = useCallback(
    (square: Square): Moves =>
      Board(boardState.board, boardState.checks, boardState.castleRights)
        .at(square)
        .getLegalMoves(),
    [boardState]
  );

  const piecePos = useMemo(() => {
    let pieceMap;
    if (!pieceMapsRef.current.length)
      pieceMap = Board(
        boardState.board,
        boardState.checks,
        boardState.castleRights
      ).get.pieceMap();
    else pieceMap = pieceMapsRef.current[currentPieceMapIdx];
    return convertPieceMapToArray(pieceMap);
  }, [boardState, currentPieceMapIdx]);

  const historyControls = useMemo(() => {
    return {
      goBackToStart: () => {
        if (!pieceMapsRef.current.length) return;
        setCurrentPieceMapIdx(0);
      },
      goBackOneMove: () => {
        if (!pieceMapsRef.current.length) return;
        setCurrentPieceMapIdx((prev) => {
          if (prev === 0) return prev;
          return prev - 1;
        });
      },
      goForwardOneMove: () => {
        if (!pieceMapsRef.current.length) return;
        setCurrentPieceMapIdx((prev) => {
          if (prev === pieceMapsRef.current.length - 1) return prev;
          return prev + 1;
        });
      },
      goToCurrentMove: () => {
        if (!pieceMapsRef.current.length) return;
        setCurrentPieceMapIdx(pieceMapsRef.current.length - 1);
      },
    };
  }, []);

  const flipBoard = useCallback(() => {
    setGameboardView((prev) => {
      return OPP_COLOR[prev];
    });
  }, []);

  const validateAndCheckPromotion = useCallback(
    (s: Square) => {
      return validateMove(s) && checkPromotion(s);
    },
    [checkPromotion, validateMove]
  );

  const onPromote = useCallback(
    (e) => {
      e.stopPropagation();
      makeMove(
        promotePopupSquare as Square,
        e.currentTarget.dataset.piece as Exclude<PieceType, 'k' | 'p'>
      );
      setPromotePopupSquare(null);
    },
    [makeMove, promotePopupSquare]
  );

  return (
    <main className={styles.main}>
      <Head>
        <title>croChess</title>
      </Head>
      <div className={styles['game-contents']}>
        <Gameboard
          view={gameboardView}
          piecePos={piecePos}
          makeMove={makeMove}
          pieceToMove={pieceToMove}
          setPieceToMove={setPieceToMove}
          getLegalMoves={getLegalMoves}
          activePlayer={activePlayerRef.current}
          promotePopupSquare={promotePopupSquare}
          setPromotePopupSquare={setPromotePopupSquare}
          checkPromotion={validateAndCheckPromotion}
          onPromote={onPromote}
        />
        <Interface
          activePlayer={activePlayerRef.current}
          claimDraw={
            !!activePlayerRef.current &&
            ClaimDrawRecord[activePlayerRef.current]
          }
          offeredDraw={
            !!activePlayerRef.current &&
            !ClaimDrawRecord[activePlayerRef.current] &&
            ClaimDrawRecord[getOppColor(activePlayerRef.current)]
          }
          gameOverDetails={gameOverDetails}
          whiteDetails={{
            maxTime: timeDetailsRef.current.maxTime,
            startTime: timeDetailsRef.current.white.startTime,
            time: whiteTime,
            setTime: setWhiteTime,
            active: !gameOverDetails && turn === 'white',
          }}
          blackDetails={{
            maxTime: timeDetailsRef.current.maxTime,
            startTime: timeDetailsRef.current.black.startTime,
            time: blackTime,
            setTime: setBlackTime,
            active: !gameOverDetails && turn === 'black',
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
