import { getActivePlayer } from './misc';
import { Gameboard } from 'crochess-api';
import {
  FetchGameGameDetails,
  FetchGameStateUpdaters,
  GameInterface,
  UpdateGameGameDetails,
  UpdateGameStateUpdaters,
} from '../types/interfaces';
import { AllTimes, GameStateReducer } from '../types/types';
import { Colors } from 'crochess-api/dist/types/types';
import { OPP_COLOR } from 'crochess-api/dist/utils/constants';

const updateGameDetails = {
  onUpdate: (
    game: GameInterface,
    gameDetails: UpdateGameGameDetails,
    stateUpdaters: UpdateGameStateUpdaters
  ) => {
    const { timeDetailsRef, pieceMapsRef } = gameDetails;
    const {
      setGameOverDetails,
      setBoardState,
      setMoveHistory,
      setWhiteTime,
      setBlackTime,
      setCurrentPieceMapIdx,
      setClaimDrawRecord,
      setTurn,
    } = stateUpdaters;

    if (game.active) {
      timeDetailsRef.current[game.turn] = {
        turnStart: game.turnStart || Date.now(),
        startTime: game[game.turn].timeLeft,
      };

      timeDetailsRef.current[getOppColor(game.turn)] = {
        // need to reset to 0 so Timer doesnt use the old values when turn changes
        turnStart: 0,
        startTime: 0,
      };

      pieceMapsRef.current.push(
        Gameboard(
          new Map(Object.entries(game.board)),
          game.checks,
          game.castle
        ).get.pieceMap()
      );
      setCurrentPieceMapIdx((prev) => {
        if (prev === pieceMapsRef.current.length - 2)
          return pieceMapsRef.current.length - 1;
        else return prev;
      });
    }

    setTurn(game.turn);

    setMoveHistory(game.history);

    setWhiteTime(game.white.timeLeft);
    setBlackTime(game.black.timeLeft);

    setBoardState({
      board: new Map(Object.entries(game.board)),
      checks: game.checks,
      castleRights: game.castle,
    });

    setClaimDrawRecord(game.claimDraw);

    if (!game.active) {
      setGameOverDetails({
        winner: game.winner,
        reason: game.causeOfDeath,
      });
    }
  },
};

export default updateGameDetails;
