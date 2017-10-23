import {NineMensMorrisMove} from '../game/NineMensMorrisMove.js';
import {MorrisGame} from '../game/NineMensMorrisGame.js';
import {getRandomInt} from '../helpers/Util.js';

import {Agent} from './Agent.js';

export class NaiveRandomAgent extends Agent
{
  getNextMove()
  {
    let from = null;
    let to = null;
    let removedStone = null;

    if( this.game.getPhaseForPlayer(this.player) === MorrisGame.PHASE1 )
    {

      do {
        to = getRandomInt(0,23);
        console.log(from,to,this.game.currentTurn);
      } while( !this.game.playerAllowedToMove(this.player,from,to) );


    }
    else
    {
      const stonePositions = this.game.getPositionsForPlayer(this.player);

      do {
        from = stonePositions[getRandomInt(0,stonePositions.length - 1)];
        to = getRandomInt(0,23);
      } while( !this.game.playerAllowedToMove(this.player,from,to) );
    }

    if( this.game.moveRequiresRemoval(this.player,from,to) )
    {
        const piecesToRemove = this.game.getRemovablePiecesForPlayer(this.player);
        const randomIdx = getRandomInt(0,piecesToRemove.length - 1);
        removedStone = piecesToRemove[randomIdx];
        console.log('removing',this.player,removedStone,piecesToRemove);
    }

    return new NineMensMorrisMove(this.player,to,from,removedStone);
  }
}
