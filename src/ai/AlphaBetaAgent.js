import {NineMensMorrisGameConfiguration} from '../game/NineMensMorrisGameConfiguration.js';
import {NineMensMorrisMove} from '../game/NineMensMorrisMove.js';

import {getRandomInt} from '../helpers/Util.js';

import {Agent} from './Agent.js';


export class AlphaBetaAgent extends Agent
{


  _initializeZobrist()
  {
    //Initalize transpositionTable
    for(let player = 0; player < 2; player++)
    {
      for(let i = 0;i<24;i++)
      {
        //Initialize with random 32 bit int
        this.ZOBRIST[player][i] = getRandomInt(0,( 1 << 31 ) >>> 0);
      }
    }
  }


  _initializeTranspositionTable()
  {
    for(let player = 0; player < 2; player++)
    {
      for( let i =0; i<this.TRANSPOSITION_TABLE_SIZE; i++ )
      {
        this.transpositionTable[player][i] = {hash: -1,
                                              score: -this.SCORE_INF,
                                              height: -1};
      }
    }
  }


  reinitializeState()
  {
    this._initializeZobrist();
    this._initializeTranspositionTable();
  }


  setOptions(options)
  {
      this.options = options;
  }


  constructor()
  {
    super();

    //Hashtable for each player
    this.ZOBRIST = [ new Array(24), new Array(24) ];

    this.TRANSPOSITION_TABLE_SIZE = 100000;

    //transpositionTable for each player
    this.transpositionTable = [ new Array(this.TRANSPOSITION_TABLE_SIZE),
                                new Array(this.TRANSPOSITION_TABLE_SIZE)];



    this.reinitializeState();

    this.SCORE_INF = 99999;

    this.SCORE_WIN = 99998;

    this.SCORE_DRAW = 0;

  }


  _evaluateConfiguration(player, configuration)
  {
    const opponent = 1 - player;
    if(configuration.hasWon(opponent))
    {
      return -this.SCORE_WIN;
    }
    else if(configuration.hasWon(player))
    {
      return this.SCORE_WIN;
    }
    else if(configuration.isDraw())
    {
      return this.SCORE_DRAW;
    }
    else
    {
      const removedStones = configuration.getRemovedStonesForPlayer(opponent);

      const ownStones = configuration.getAmountStones(player);
      const opponentStones = configuration.getAmountStones(opponent);
      const closedMills = configuration.getNumberOfClosedMillsForPlayer(player);
      const opponentClosedMills = configuration.getNumberOfClosedMillsForPlayer(opponent);

      const ownFreedom = configuration.getDegreeOfFreedomForPlayer(player);
      const opponentFreedom = configuration.getDegreeOfFreedomForPlayer(opponent);

      const score = 2 * (ownFreedom - opponentFreedom) +
                    1 * (ownStones - opponentStones) +
                   10 * (closedMills - opponentClosedMills);

      return score;
    }
  }


  thinkTimeExceeded()
  {
    if(this.options.think_time)
    {
      const timeNow = new Date();
      const diff = timeNow - this.startDate;
      if(diff > this.options.think_time)
      {
        return true;
      }
    }
    return false;
  }

  //Alpha  = best _already_ explored option for the maximizer
  //Beta   = best _already_ explored option for the minimizer
  //This is essentially  based on https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning
  miniMax(player, configuration, move, currentDepth, maxDepth, alpha, beta)
  {


    if(this.thinkTimeExceeded())
    {
      return null;
    }

    const opponent = 1 - player;

    const configurationHash = configuration.getUnifiedShiftHash(this.ZOBRIST);

    const ttLookUp = this.transpositionTable[player][configurationHash % this.TRANSPOSITION_TABLE_SIZE];
    const currentHeight = maxDepth - currentDepth;

    //Perform transpositionTable Lookup.
    if(ttLookUp.hash === configurationHash && currentDepth !== 0)
    {
      if(ttLookUp.height >= currentHeight)
      {
        //In the past we have seen that position at the same height in the search tree.
        return {score: ttLookUp.score, move: move};
      }

    }


    if(currentDepth === maxDepth)
    {

      const score = this._evaluateConfiguration(player,configuration);

      if(currentHeight >= ttLookUp.height)
      {
        ttLookUp.score = score;
        ttLookUp.height = currentHeight;
        ttLookUp.hash = configurationHash;
      }

      return {score: score, move: move};

    }
    else
    {
      let maxScore = alpha;
      let bestMove = null;
      let numConfigs = 0;

      for(let successorConfiguration of configuration.generateSuccessorConfiguration(player))
      {
        numConfigs += 1;

        let result = this.miniMax(opponent,
                                  successorConfiguration.configuration,
                                  successorConfiguration.move,
                                  currentDepth+1, maxDepth,
                                  -beta,
                                  -maxScore
        );

        if(result == null)
        {
          //Think Time exceeded
          return null;
        }

        if( -result.score > maxScore)
        {
          maxScore = -result.score;

          if(maxScore >= beta)
          {
            break;
          }

          if (currentDepth === 0)
          {
            bestMove = successorConfiguration.move;
          }
        }

      }

      if(numConfigs === 0)
      {
        //If were unable to generate a successorConfiguration we lost.
        const score = this._evaluateConfiguration(player,configuration);

        if(currentHeight >= ttLookUp.height)
        {
          ttLookUp.score = score;
          ttLookUp.height = currentHeight;
          ttLookUp.hash = configurationHash;
        }
        return {score: score, move: move};
      }
      else
      {

        if(currentHeight >= ttLookUp.height)
        {
          ttLookUp.score = maxScore;
          ttLookUp.height = currentHeight;
          ttLookUp.hash = configurationHash;
        }
        return {score: maxScore, move: bestMove};
      }

    }
  }

  //Transposition Table must Age upon subsequent move calculations otherwise
  //their values cannot be trusted for the next getNextMove call.
  ageTranspositionTable()
  {
    for(let player = 0; player < 2; player++)
    {
      for( let i =0; i<this.TRANSPOSITION_TABLE_SIZE; i++ )
      {
        if(this.transpositionTable[player][i].height > -1)
        {
          this.transpositionTable[player][i].height--;
        }
      }
    }
  }


  getNextMove(configuration,player,callback)
  {

    let currentBestMove = null;
    let terminate = false;

    //We must increase reduce the height of the transpositionTable for this move.
    this.ageTranspositionTable();

    if(this.options.think_time)
    {
      this.startDate = new Date();
    }
    else
    {
      this.startDate = null;
    }

    let move = null;

    if(this.startDate != null && this.options.think_time)
    {
      //We have a limited think time, iterative deepening...
      let bestResult = null;
      for(let i = 1; i < 21; i++)
      {
        const maxDepth = i;
        const startDepth = 0;
        const result = this.miniMax(player, configuration, null,
          startDepth, maxDepth, -this.SCORE_INF, this.SCORE_INF);

        if( result != null ) //Was the current level aborted due to think time?
        {
          console.log("Calculated Best Move for depth:",i);
          bestResult = result;
        }
        else
        {
          break;
        }

      }

      move = bestResult.move;
    }
    else if(this.options.moves_ahead)
    {
      //We have a predefined MaxDepth to calculate.
      const maxDepth = this.options.moves_ahead + 1;
      const startDepth = 0;
      const result = this.miniMax(player, configuration, null,
        startDepth, maxDepth, -this.SCORE_INF, this.SCORE_INF);

      move = result.move;
    }

    callback(move);

  }
}
