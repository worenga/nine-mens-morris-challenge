import {NineMensMorrisGameConfiguration} from '../game/NineMensMorrisGameConfiguration.js';
import {NineMensMorrisMove} from '../game/NineMensMorrisMove.js';

import {getRandomInt} from '../helpers/Util.js';

import {Agent} from './Agent.js';

const SCORE_INF  =  99999;
const SCORE_LOST = -99998;
const SCORE_DRAW = 0;


export class AlphaBetaAgent extends Agent
{

  constructor()
  {
    super();
    //48 bit
    this.transpositionTable = [];

  }

  _evaluateConfiguration(player, configuration)
  {

    const opponent = 1 - player;

    if(configuration.hasWon(opponent))
    {
      return SCORE_LOST;
    }
    else if(configuration.hasWon(player))
    {
      return -SCORE_LOST;
    }
    else if(configuration.isDraw())
    {
      return SCORE_DRAW;
    }
    else
    {
      const removedStones = configuration.getRemovedStonesForPlayer(opponent);
      const ownStones = configuration.getAmountStones(player);
      const opponentStones = configuration.getAmountStones(opponent);
      const closedMills = configuration.getNumberOfClosedMillsForPlayer(player);
      const opponentClosedMills = configuration.getNumberOfClosedMillsForPlayer(opponent);
      //console.log(ownStones,removedStones);
      //TODO open mills? movable freedom?
      return 10*(ownStones - opponentStones)  + 2*closedMills - opponentClosedMills;
    }
  }


  //Alpha  = best _already_ explored option for the maximizer
  //Beta   = best _already_ explored option for the minimizer

  miniMax(player, configuration, move, start_depth, depth, alpha, beta)
  {
    const opponent = 1 - player;


    if(depth === 0)
    {
        const score = this._evaluateConfiguration(player,configuration);
        return {score: score, move: move};
    }
    else
    {

      let maxScore = alpha;
      let bestMove = null;
      let numConfigs = 0;
 
      for(let successorConfiguration of configuration.getSuccessorConfiguration(player))
      {
        numConfigs += 1;

        let result = this.miniMax(opponent,
                                        successorConfiguration.configuration,
                                        successorConfiguration.move,
                                        start_depth, depth-1,
                                        -beta,
                                        -maxScore
        );



        if( (-1 * result.score) > maxScore)
        {
          maxScore = (-1 * result.score);
          if(maxScore >= beta)
          {
            break;
          }

          if (depth === start_depth)
          {
            bestMove = successorConfiguration.move;
          }
        }
      }

      if(numConfigs === 0)
      {
        const score = this._evaluateConfiguration(player,configuration);
        return {score: score, move: move};
      }

      return {score: maxScore, move: bestMove};
    }

  }

  getNextMove(configuration,player,callback)
  {

    let currentBestMove = null;
    let terminate = false;

    const depth = 6;
    let result = this.miniMax(player, configuration, null,
      depth, depth, -SCORE_INF, SCORE_INF);

    let move = result.move;

    callback(move);

  }
}
