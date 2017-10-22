//import {NineMensMorrisGame} from './game/Game';
import {MorrisBoardUi} from './renderer/MorrisBoardUi.js';
import {MorrisGame} from './game/NineMensMorrisGame.js';

const CANVAS_ID = 'gameboard';

let ui = new MorrisBoardUi(CANVAS_ID);




//Initialize
let game = new MorrisGame();

game.on("game:ended",(isDraw, winner)=>{
  console.log('game ended!', isDraw, winner);

});

game.on("move:move_required",(nextPlayer)=>{
  if (nextPlayer === MorrisGame.white) {
    ui.setTurn(MorrisBoardUi.WHITE_MOVE);
  } else {
    ui.setTurn(MorrisBoardUi.BLACK_MOVE);
  }
});

ui.on( "stone:remove", (position) => {
  game.removeStone(position);
  return true;
} );

game.on("move:removal_required",(player)=>{
  ui.enableRemovalIndicatorsFor(game.getRemovablePiecesForPlayer(player));
  console.log('removal required');
  if (player === MorrisGame.white) {
    ui.setTurn(MorrisBoardUi.WHITE_REMOVE);
  } else {
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
  return game.applyMove(player,from,to);
});

ui.setTurn(MorrisBoardUi.WHITE_MOVE);
