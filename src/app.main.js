//import {NineMensMorrisGame} from './game/Game';
import {NineMensMorrisBoardUi} from './renderer/NineMensMorrisBoardUi.js';
import {NineMensMorrisGame} from './game/NineMensMorrisGame.js';

import {HumanAgent} from './ai/HumanAgent.js';
import {WorkerProxyAgent} from './ai/WorkerProxyAgent.js';

import Vue from 'vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';




let app = new Vue({
  el: '#gameboard-container',

  data: {
    activePlayerAgents: [null,null],
    availableAgents: [],
    selectedAgentWhite: null,
    selectedAgentBlack: null,
  },

  components: {
    PulseLoader
  },

  mounted: function () {

    const CANVAS_ID = 'gameboard';

    this.game = new NineMensMorrisGame();
    this.ui = new NineMensMorrisBoardUi(CANVAS_ID);
    this.ui.setTurn(NineMensMorrisBoardUi.WHITE_MOVE);


    this.availableAgents.push({id:'human', name: "Human Player", controller: HumanAgent});
    this.availableAgents.push({id:'random', name:"Random AI", controller: WorkerProxyAgent, args: { bundle: "ai_random.bundle.js"} });
    this.availableAgents.push({id:'alphabeta', name:"AlphaBeta AI", controller: WorkerProxyAgent, args: { bundle: "ai_alphabeta.bundle.js"} });

    this.selectedAgentWhite = 'human';
    this.selectedAgentBlack = 'alphabeta';

    this.game.on("game:ended",(isDraw, winner) => {
      if(isDraw)
      {
        this.ui.setOverlay(NineMensMorrisBoardUi.OVERLAY_DRAW);
      }
      else
      {
        if (winner === NineMensMorrisGame.PLAYER_WHITE)
        {
          this.ui.setOverlay(NineMensMorrisBoardUi.OVERLAY_WHITE_WON);
        }
        else
        {
          this.ui.setOverlay(NineMensMorrisBoardUi.OVERLAY_BLACK_WON);
        }
      }
    });

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

    this.ui.on( "stone:remove", (position) => {
      this.game.removeStone(position);
      return true;
    });

    this.game.on("boardstate:changed",() => {
      const config = this.game.getConfiguration();
      this.ui.setStones(config.getPositionsForPlayer(NineMensMorrisGame.PLAYER_WHITE),
                        config.getPositionsForPlayer(NineMensMorrisGame.PLAYER_BLACK),
                        config.getRemovedStonesForPlayer(NineMensMorrisGame.PLAYER_WHITE),
                        config.getRemovedStonesForPlayer(NineMensMorrisGame.PLAYER_BLACK)
      );
    });

    this.game.on("move:undone",(move) => {
      this.ui.hideOverlays();
    });

    this.game.on("move:removal_required",(player) => {

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

    this.ui.on("stone:moved",(player, from, to) => {
      return this.game.createAndApplyMove(player,from,to);
    });

  },

  methods:
  {
    reset: function()
    {
      setTimeout( () => {
        this.ui.hideOverlays();
        this.game.reset();
      }, 0);
    },

    undo: function()
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

    setPlayerAgent: function(player,id)
    {
      let found = null;
      let agent = this.availableAgents.filter( (obj) => {return obj.id === id;})[0];
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

    enableNextPlayer: function(nextPlayer)
    {
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
        this.ui.setTurn(NineMensMorrisBoardUi.NO_TURN);
        console.log('Asking AI for ',nextPlayer, this.game.getConfiguration());
        this.activePlayerAgents[nextPlayer].getNextMove(
          this.game.getConfiguration(), nextPlayer,
          (nextMove) => {
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
    selectedAgentWhite: function (change) {
      this.playerAgentTakeControl(NineMensMorrisGame.PLAYER_WHITE,change);
    },
    selectedAgentBlack: function (change) {
      this.playerAgentTakeControl(NineMensMorrisGame.PLAYER_BLACK,change);
    }
  },
});
