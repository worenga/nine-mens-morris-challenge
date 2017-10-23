//import {NineMensMorrisGame} from './game/Game';
import {MorrisBoardUi} from './renderer/MorrisBoardUi.js';
import {MorrisGame} from './game/NineMensMorrisGame.js';

import {HumanAgent} from './ai/HumanAgent.js';
import {NaiveRandomAgent} from './ai/NaiveRandomAgent.js';

const CANVAS_ID = 'gameboard';

let ui = new MorrisBoardUi(CANVAS_ID);
let game = new MorrisGame();

let agentRegistry = {};
agentRegistry.HUMAN_AGENT = {controller: HumanAgent};
agentRegistry.HUMAN_NAIVE_PLAYER_AGENT = {controller: NaiveRandomAgent};

let activePlayerAgents = [
  new agentRegistry.HUMAN_AGENT.controller(game,MorrisGame.PLAYER_WHITE),
  new agentRegistry.HUMAN_NAIVE_PLAYER_AGENT.controller(game,MorrisGame.PLAYER_BLACK)
];
console.log(activePlayerAgents);

ui.setTurn(MorrisBoardUi.WHITE_MOVE);


document.getElementById("reset").onclick = (e) => {
  game.reset();
};

document.getElementById("undo").onclick = (e) => {
  game.undoLastMove(2);
};

game.on("game:ended",(isDraw, winner) => {
  console.log('game ended! (isDraw, winner)', isDraw, winner);
});

game.on("move:move_required",(nextPlayer) => {
  if(activePlayerAgents[nextPlayer].isHuman())
  {
    if (nextPlayer === MorrisGame.PLAYER_WHITE)
    {
      ui.setTurn(MorrisBoardUi.WHITE_MOVE);
    }
    else
    {
      ui.setTurn(MorrisBoardUi.BLACK_MOVE);
    }
  }
  else
  {
    let nextMove = activePlayerAgents[nextPlayer].getNextMove();
    console.log(nextMove);
    if( !game.applyMove(nextMove) )
    {

      throw "AI Generated Invalid Move.";
    }
  }
});

ui.on( "stone:remove", (position) => {
  game.removeStone(position);
  return true;
});



game.on("boardstate:changed",() => {
  ui.setStones(game.getPositionsForPlayer(MorrisGame.PLAYER_WHITE),
               game.getPositionsForPlayer(MorrisGame.PLAYER_BLACK),
               game.getRemovedStonesForPlayer(MorrisGame.PLAYER_WHITE),
               game.getRemovedStonesForPlayer(MorrisGame.PLAYER_BLACK)
  );
});

game.on("move:revoked",(move) => {
  //TODO
});

game.on("move:removal_required",(player) => {
  ui.enableRemovalIndicatorsFor(game.getRemovablePiecesForPlayer(player));
  if (player === MorrisGame.PLAYER_WHITE)
  {
    ui.setTurn(MorrisBoardUi.WHITE_REMOVE);
  }
  else
  {
    ui.setTurn(MorrisBoardUi.BLACK_REMOVE);
  }
});

ui.on("stone:begin_move",(player, from) => {
  let allowed_positions = [];
  for(let to = 0; to < 24; to++)
  {
    if(game.playerAllowedToMove(player, from, to))
    {
      allowed_positions.push(to);
    }
  }
  ui.setAllowedHints(allowed_positions);
});

ui.on("stone:moved",(player, from, to) => {
  return game.createAndApplyMove(player,from,to);
});
