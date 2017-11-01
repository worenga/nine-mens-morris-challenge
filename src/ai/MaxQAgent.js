import {NineMensMorrisGameConfiguration} from '../game/NineMensMorrisGameConfiguration.js';
import {NineMensMorrisMove} from '../game/NineMensMorrisMove.js';

import {getRandomInt, shuffle} from '../helpers/Util.js';

import {Agent} from './Agent.js';


export class MaxQAgent extends Agent
{

  //Prepare a hash IV for Zobrist Hashing
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

  reinitializeState()
  {
    this._initializeZobrist();

  }

  constructor()
  {
    super();

    this.ZOBRIST = [ new Array(24), new Array(24) ];

    this._initializeZobrist();

    this.SCORE_WIN = 100000;

    this.SCORE_DRAW = 10000;

    this.SCORE_START = 100;

  }

  setOptions(options)
  {
      this.options = options;
  }

  //Evaluate current Position (same as AlphaBeta)
  _evaluateConfiguration(player,move,configuration)
  {

    const opponent = 1 - player;
    let score = 0;
    let isFinal = false;
    if(configuration.hasWon(opponent))
    {
      score = 0;
      isFinal = true;
    }
    else if(configuration.hasWon(player))
    {
      score = this.SCORE_WIN;
      isFinal = true;
    }
    else if(configuration.isDraw())
    {
      score = 0;
      isFinal = true;
    }
    else
    {
      score = 0;

      if(move.removedPiece != null)
      {
        score += 1;
      }

      const ownStones = configuration.getAmountStones(player);
      const opponentStones = configuration.getAmountStones(opponent);

      const ownFreedom = configuration.getDegreeOfFreedomForPlayer(player);
      const opponentFreedom = configuration.getDegreeOfFreedomForPlayer(opponent);

      score += (ownStones - opponentStones)+2*(ownFreedom-opponentFreedom);
    }
    return {score:score, isFinal:isFinal};
  }


  getNextMove(configuration,player,callback)
  {

    //Initalize Q Matrix to Zero:
    let maxQ_Table = {};
    const iterations = this.options.iterations || 100;
    const gamma = 0.9;

    //Iterate over successor States
    for(let startState of configuration.generateSuccessorConfiguration(player))
    {

      for( let j=0; j < iterations; j++ )
      {
        let currentNextState = startState;
        let currentPlayer = player;

        //Do while the goal state hasn't been reached...
        let gameHasEnded = false;
        let currentConfigurationHash = configuration.getUnifiedShiftHash(this.ZOBRIST);

        let nextConfigurationHash;
        let i=0;

        while(!gameHasEnded)
        {
          if(i++ > 30) //Impair Horizon for efficiency.
          {
            break;
          }

          let res = this._evaluateConfiguration(player,currentNextState.move,currentNextState.configuration);

          if(res.isFinal === true)
          {
            gameHasEnded = true;
          }
          let score = res.score;


          //Update MaxQ:
          if(!maxQ_Table[currentConfigurationHash])
          {
            maxQ_Table[currentConfigurationHash] = {};
          }

          //Hash the move as well
          //TODO: Our hash only checks
          //for symmetries alongside the reached states
          const moveHash = currentNextState.move.from +
                           ((currentNextState.move.to * 24) +
                           (currentNextState.move.removedPiece)) * 24;


          let maxQ_NextStates = 0;

          if(!gameHasEnded)
          {
            let followUpConfigurations = Array.from(currentNextState.configuration.
              generateSuccessorConfiguration(1 - currentPlayer));

            currentNextState = shuffle(followUpConfigurations)[0];
            nextConfigurationHash = currentNextState.configuration.getUnifiedShiftHash(this.ZOBRIST);


            maxQ_NextStates = 0;
            for(let followUpStates of followUpConfigurations)
            {
              nextConfigurationHash = followUpStates.configuration.getUnifiedShiftHash(this.ZOBRIST);
              let lookup = maxQ_Table[nextConfigurationHash];
              if(lookup!==undefined){
                let movesQ = Object.values(lookup);
                if(movesQ.length > 0)
                {
                  maxQ_NextStates = Math.max(...movesQ);
                }
              }
            }

          }

          //Update Cache
          maxQ_Table[currentConfigurationHash][moveHash] = score + gamma * maxQ_NextStates;

          //prepare next loop
          currentPlayer = 1 - currentPlayer;
          currentConfigurationHash = nextConfigurationHash;
        }

      }
    }

    const initialConfigurationHash = configuration.getUnifiedShiftHash(this.ZOBRIST);

    let bestMax = -(this.SCORE_WIN + 1);
    let bestMove = null;

    for(let followUpConfiguration of configuration.generateSuccessorConfiguration(player))
    {

      const moveHash = followUpConfiguration.move.from +
                       (followUpConfiguration.move.to * 24 +
                       followUpConfiguration.move.removedPiece) * 24;

      if((maxQ_Table[initialConfigurationHash][moveHash]) > bestMax)
      {
        bestMax = maxQ_Table[initialConfigurationHash][moveHash];
        bestMove = followUpConfiguration.move;
      }

    }

    callback(bestMove);

  }
}
