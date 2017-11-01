import {NineMensMorrisBoardUi} from '../ui/NineMensMorrisBoardUi.js';
import {NineMensMorrisGame} from '../game/NineMensMorrisGame.js';

import {HumanAgent} from '../ai/HumanAgent.js';
import {WorkerProxyAgent} from '../ai/WorkerProxyAgent.js';

import PlayerArea from './player-area.vue';

/**
 * This is the main component of the App. It is comprised out of two player area
 * components and NineMensMorrisBoardUi which draws the game board
 * This component acts as the interconnect between Game state and Game ui.
*/

export default
{
  props: {
    winStats:{
      type:Array,
      required: false,
      default: () => [0,0]
    }
  },

  data ()
  {
    return {

      activePlayerAgents: [null,null],

      activePlayer: 0,

      numberOfWins: this.winStats,

      showDrawMessage: false,

      drawType:'',

      isThinking: [false,false],

      selectedAgent: [{id:null},{id:null}],

      availableAgents: [

        {id:'human', name: "Human Player", controller: HumanAgent},

        {id:'random', name:"AI: Random", controller: WorkerProxyAgent, args: { bundle: "ai_random.bundle.js"} },

        {id:'alphabeta-1',
         name:"AI: AlphaBeta, 1s think-time",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {think_time: 1000}
               }
        },
        {id:'alphabeta-2',
         name:"AI: AlphaBeta, 2s think-time",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {think_time: 2000}
               }
        },

        {id:'alphabeta-5',
         name:"AI: AlphaBeta, 5s think-time",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {think_time: 5000}
               }
        },

        {id:'alphabeta-10',
         name:"AI: AlphaBeta, 10s think-time",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {think_time: 10000}
               }
        },

        {id:'alphabeta-20',
         name:"AI: AlphaBeta, 20s Think-Time",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {think_time: 20000}
               }
        },

        {id:'alphabeta-2-ahead',
         name:"AI: AlphaBeta, 2 moves ahead",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {moves_ahead: 2}
               }
        },

        {id:'alphabeta-4-ahead',
         name:"AI: AlphaBeta, 4 moves ahead",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {moves_ahead: 4}
               }
        },

        {id:'alphabeta-6-ahead',
         name:"AI: AlphaBeta, 6 moves ahead",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {moves_ahead: 6}
               }
        },

        {id:'alphabeta-8-ahead',
         name:"AI: AlphaBeta, 8 moves ahead",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {moves_ahead: 8}
               }
        },

        {id:'alphabeta-10-ahead',
         name:"AI: AlphaBeta, 10 moves ahead",
         controller: WorkerProxyAgent,
         args: { bundle: "ai_alphabeta.bundle.js",
                 agent_options: {moves_ahead: 10}
               }
        },

        {id:'max_q10',
          name:"AI: MaxQ 10 Games each",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_maxq.bundle.js",
            agent_options: {iterations: 10 }
          }
        },

        {id:'max_q25',
          name:"AI: MaxQ 25 Games each",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_maxq.bundle.js",
            agent_options: {iterations: 25 }
          }
        },

        {id:'max_q50',
          name:"AI: MaxQ 50 Games each",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_maxq.bundle.js",
            agent_options: {iterations: 50 }
          }
        },

        {id:'max_q75',
          name:"AI: MaxQ 75 Games each",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_maxq.bundle.js",
            agent_options: {iterations: 75 }
          }
        },

        {id:'max_q100',
          name:"AI: MaxQ 100 Games each",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_maxq.bundle.js",
            agent_options: {iterations: 100 }
          }
        },

        {id:'max_q200',
          name:"AI: MaxQ 200 Games each",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_maxq.bundle.js",
            agent_options: {iterations: 200 }
          }
        },


        {id:'temporal-50k-notake',
         name:"AI: TD-Learning (50k Epochs trained)",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_temporal.bundle.js",
            agent_options: {neural_net: '50k-notake' }
          }
        },

        {id:'temporal-100k-notake',
         name:"AI: TD-Learning (100k Epochs trained)",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_temporal.bundle.js",
            agent_options: {neural_net: '100k-notake' }
          }
        },

        {id:'temporal-200k-notake',
        name:"AI: TD-Learning (200k Epochs trained)",
          controller: WorkerProxyAgent,
          args: {
            bundle: "ai_temporal.bundle.js",
            agent_options: {neural_net: '200k-notake' }
          }
        },

      ]
    };
  },

  components:
  {
      PlayerArea
  },

  mounted()
  {
    const CANVAS_ID = 'gameboard';

    this.game = new NineMensMorrisGame();
    this.ui = new NineMensMorrisBoardUi(CANVAS_ID);

    this.ui.setTurn(NineMensMorrisBoardUi.WHITE_MOVE);

    //set selectedAgent to trigger watch
    //@See https://vuejs.org/v2/api/#vm-watch
    this.selectedAgent = [{id:'human'},{id:'alphabeta-2'}];


    //Invoked when the game engine signaled that the game has ended
    this.game.on("game:ended",(isDraw, winner, typeOfDraw) =>
    {
      if(isDraw)
      {
        this.showDrawMessage=true;
        this.drawType=typeOfDraw;
        this.ui.setOverlay(NineMensMorrisBoardUi.OVERLAY_DRAW,typeOfDraw);
        console.log("Game Ended: Draw", typeOfDraw);
      }
      else
      {

        this.numberOfWins.splice(winner, 1, this.numberOfWins[winner] + 1);

        if (winner === NineMensMorrisGame.PLAYER_WHITE)
        {
          this.ui.setOverlay(NineMensMorrisBoardUi.OVERLAY_WHITE_WON);
          console.log("Game Ended: White won");
        }
        else
        {
          this.ui.setOverlay(NineMensMorrisBoardUi.OVERLAY_BLACK_WON);
          console.log("Game Ended: Black won");
        }
      }
    });


    //Invoked when the game engine requires a new move from a player
    this.game.on("move:move_required", (nextPlayer) => {
      setTimeout( () => {

        //Prevent bogus side effects when reset or undo
        //was pressed and currentTurn might have been reset.
        if(this.game.currentTurn != nextPlayer)
        {
          return ;
        }

        this.enableNextPlayer(nextPlayer);
      }, 0 );
    });


    //Invoked when the user has chosen a stone to remove after a mill
    this.ui.on( "stone:remove", (position) => {
      this.ui.hideOverlays();
      this.game.removeStone(position);
      return true;
    });


    //Invoked whenever the game state has changed and the board positions
    //must be updated
    this.game.on("boardstate:changed",() => {
      const config = this.game.getConfiguration();
      this.ui.setStones(config.getPositionsForPlayer(NineMensMorrisGame.PLAYER_WHITE),
                        config.getPositionsForPlayer(NineMensMorrisGame.PLAYER_BLACK),
                        config.getRemovedStonesForPlayer(NineMensMorrisGame.PLAYER_WHITE),
                        config.getRemovedStonesForPlayer(NineMensMorrisGame.PLAYER_BLACK)
      );
    });


    //Invoked when some move was undone in the game engine
    this.game.on("move:undone",(move) => {
      this.ui.hideOverlays();
    });


    this.game.on("move:removal_required",(player) => {

      this.ui.setOverlay(NineMensMorrisBoardUi.OVERLAY_MILL);

      this.ui.enableRemovalIndicatorsFor(
          this.game.getConfiguration().getRemovablePiecesForPlayer(player));

      if (player === NineMensMorrisGame.PLAYER_WHITE)
      {
        this.ui.setTurn(NineMensMorrisBoardUi.WHITE_REMOVE);
      }
      else
      {
        this.ui.setTurn(NineMensMorrisBoardUi.BLACK_REMOVE);
      }

    });


    //A stone was picked up by the (human) user.
    this.ui.on("stone:begin_move",(player, from) => {
      let allowed_positions = [];

      allowed_positions.push(from);

      for(let to = 0; to < 24; to++)
      {
        if(this.game.playerAllowedToMove(player, from, to))
        {
          allowed_positions.push(to);
        }
      }

      this.ui.setAllowedHints(allowed_positions);

    });


    //The (human) player has chosen to move or set a stone.
    this.ui.on("stone:moved",(player, from, to) => {
      return this.game.createAndApplyMove(player,from,to);
    });


  },

  methods:
  {
    //Invoked when the user changed the AI for the player
    changeActiveAgent(playerId, agent)
    {
      if(playerId === NineMensMorrisGame.PLAYER_WHITE ||
         playerId === NineMensMorrisGame.PLAYER_BLACK)
      {
        let replaced = this.selectedAgent.slice(0);
        replaced[playerId]={id:agent};
        this.selectedAgent = replaced;
      }
      else
      {
          throw `Encountered undefined PlayerId=${playerId}`;
      }

    },


    reset()
    {
      //the name setTimeout is misleading here,
      //its enqueing the action into the global JS event loop
      setTimeout( () => {

        this.showDrawMessage=false;

        for(let agent of this.activePlayerAgents)
        {
          agent.newGame();
        }

        this.ui.hideOverlays();

        this.ui.setTurn(NineMensMorrisBoardUi.WHITE_MOVE);

        this.game.reset();

      }, 0);

    },


    resetWinStats()
    {
      this.numberOfWins = [0,0];
    },


    undo()
    {
      setTimeout( () => {
        if(this.activePlayerAgents[1-this.game.currentTurn].isHuman())
        {
            this.game.undoLastMove(1);
        }
        else
        {
          this.game.undoLastMove(2);
        }
      }, 0 );
    },


    setPlayerAgent(player,id)
    {
      this.isThinking.splice(player, 1, false);

      let found = null;
      const agent = this.availableAgents.filter( (obj) => {return obj.id === id;})[0];

      if(agent)
      {
        //Terminate old agent:
        if(this.activePlayerAgents[player] !== null)
        {
          this.activePlayerAgents[player].terminate();
        }

        this.activePlayerAgents[player] = new agent.controller(agent.args);
      }
    },


    enableNextPlayer(nextPlayer)
    {

      this.activePlayer = nextPlayer;

      if(this.activePlayerAgents[nextPlayer].isHuman())
      {
        if (nextPlayer === NineMensMorrisGame.PLAYER_WHITE)
        {
          this.ui.setTurn(NineMensMorrisBoardUi.WHITE_MOVE);
        }
        else
        {
          this.ui.setTurn(NineMensMorrisBoardUi.BLACK_MOVE);
        }
      }
      else
      {

        this.isThinking.splice(nextPlayer, 1, true);

        this.ui.setTurn(NineMensMorrisBoardUi.NO_TURN);
        this.activePlayerAgents[nextPlayer].getNextMove(
          this.game.getConfiguration(), nextPlayer,
          (nextMove) => {
            this.isThinking.splice(nextPlayer, 1, false);

            if( !this.game.applyMove(nextMove) )
            {
              console.log(this.game);
              console.log(nextMove);
              throw "AI generated invalid move.";
            }
          }
        );
      }
    },

    playerAgentTakeControl(player,type)
    {
      this.setPlayerAgent(player,type);

      if(this.game.currentTurn === player)
      {
        this.enableNextPlayer(player);
      }

    }

  },

  watch: {
    selectedAgent: {
      handler(after, before)
      {
        for( let idx=0; idx<after.length; idx++)
        {
          if(after[idx].id !== before[idx].id)
          {
            this.playerAgentTakeControl(idx,after[idx].id);
          }
        }
      }
    },
    numberOfWins()
    {
      this.$emit('stats-update',this.numberOfWins);
    }
  }

};
