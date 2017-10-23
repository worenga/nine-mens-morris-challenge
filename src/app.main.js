//import {NineMensMorrisGame} from './game/Game';
import {MorrisBoardUi} from './renderer/MorrisBoardUi.js';
import {MorrisGame} from './game/NineMensMorrisGame.js';

import {HumanAgent} from './ai/HumanAgent.js';
import {NaiveRandomAgent} from './ai/NaiveRandomAgent.js';

import Vue from 'vue';

let app = new Vue({
  el: '#gameboard-container',
  data: {
    activePlayerAgents: [null,null],
    availableAgents: [],
    selectedAgentWhite: null,
    selectedAgentBlack: null,
  },

  mounted: function () {
    const CANVAS_ID = 'gameboard';

    this.game = new MorrisGame();

    this.ui = new MorrisBoardUi(CANVAS_ID);
    this.ui.setTurn(MorrisBoardUi.WHITE_MOVE);

    this.availableAgents.push({id:'human', name: "Human Player", controller: HumanAgent});
    this.availableAgents.push({id:'random', name:"Random AI", controller: NaiveRandomAgent});

    this.selectedAgentWhite = 'human';
    this.selectedAgentBlack = 'random';

    this.game.on("game:ended",(isDraw, winner) => {
      //TODO: Better indicator for this!
      console.log('game ended! (isDraw, winner)', isDraw, winner);
    });

      this.game.on("move:move_required", (nextPlayer) => {
        this.enableNextPlayer(nextPlayer);
      });

      this.ui.on( "stone:remove", (position) => {
        this.game.removeStone(position);
        return true;
      });

      this.game.on("boardstate:changed",() => {
        this.ui.setStones(this.game.getPositionsForPlayer(MorrisGame.PLAYER_WHITE),
                     this.game.getPositionsForPlayer(MorrisGame.PLAYER_BLACK),
                     this.game.getRemovedStonesForPlayer(MorrisGame.PLAYER_WHITE),
                     this.game.getRemovedStonesForPlayer(MorrisGame.PLAYER_BLACK)
        );
      });

      this.game.on("move:undone",(move) => {
        //TODO
      });

      this.game.on("move:removal_required",(player) => {

        this.ui.enableRemovalIndicatorsFor(
            this.game.getRemovablePiecesForPlayer(player));

        if (player === MorrisGame.PLAYER_WHITE)
        {
          this.ui.setTurn(MorrisBoardUi.WHITE_REMOVE);
        }
        else
        {
          this.ui.setTurn(MorrisBoardUi.BLACK_REMOVE);
        }

      });

      this.ui.on("stone:begin_move",(player, from) => {
        let allowed_positions = [];
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
      this.game.reset();
    },

    undo: function()
    {
      if(this.activePlayerAgents[1-this.game.currentTurn].isHuman())
      {
          this.game.undoLastMove(1);
      }
      else
      {
        this.game.undoLastMove(2);
      }

    },

    setPlayerAgent: function(player,id)
    {
      let found = null;
      let agent = this.availableAgents.filter( (obj) => {return obj.id === id;})[0];
      if(agent)
      {
        this.activePlayerAgents[player] = new agent.controller(this.game,player);
      }
    },

    enableNextPlayer: function(nextPlayer)
    {
      if(this.activePlayerAgents[nextPlayer].isHuman())
      {
        if (nextPlayer === MorrisGame.PLAYER_WHITE)
        {
          this.ui.setTurn(MorrisBoardUi.WHITE_MOVE);
        }
        else
        {
          this.ui.setTurn(MorrisBoardUi.BLACK_MOVE);
        }
      }
      else
      {
        this.ui.setTurn(MorrisBoardUi.NO_TURN);
        //If two AI's are playing against each other setTimeout
        //will prevent infinite event bubbling.
        setTimeout(()=>{
          let nextMove = this.activePlayerAgents[nextPlayer].getNextMove();
          if( !this.game.applyMove(nextMove) )
          {
            console.log(this.game);
            console.log(nextMove);
            throw "AI generated invalid move.";
          }
        }, 1);
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
      this.playerAgentTakeControl(MorrisGame.PLAYER_WHITE,change);
    },
    selectedAgentBlack: function (change) {
      this.playerAgentTakeControl(MorrisGame.PLAYER_BLACK,change);
    }
  },
});
