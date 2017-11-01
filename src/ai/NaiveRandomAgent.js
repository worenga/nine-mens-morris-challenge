import {NineMensMorrisGameConfiguration} from '../game/NineMensMorrisGameConfiguration.js';
import {NineMensMorrisMove} from '../game/NineMensMorrisMove.js';

import {getRandomInt} from '../helpers/Util.js';

import {Agent} from './Agent.js';

//This is a simple AI that randomly chooses Moves.
//It was used for early testing and was the first strategy.
//It is also the benchmark strategy for all other AI.
export class NaiveRandomAgent extends Agent
{

  getNextMove(configuration,player,callback)
  {

    let from = null;
    let to = null;
    let removedStone = null;

    if( configuration.getPhaseForPlayer(player) === NineMensMorrisGameConfiguration.PHASE1 )
    {

      do {
        to = getRandomInt(0,23);
      } while( !configuration.playerAllowedToMove(player,from,to) );


    }
    else
    {
      const stonePositions = configuration.getPositionsForPlayer(player);

      do {
        from = stonePositions[getRandomInt(0,stonePositions.length - 1)];
        to = getRandomInt(0,23);
      } while( !configuration.playerAllowedToMove(player,from,to) );
    }

    if( configuration.moveRequiresRemoval(player,from,to) )
    {
        const piecesToRemove = configuration.getRemovablePiecesForPlayer(player);
        const randomIdx = getRandomInt(0,piecesToRemove.length - 1);
        removedStone = piecesToRemove[randomIdx];
    }

    let move = new NineMensMorrisMove(player,to,from,removedStone);


  callback(move);

  }
}
