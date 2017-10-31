import Vue from 'vue';
import MorrisGame from './components/morris-game.vue';

import './app.scss';

const app = new Vue(
  {
  el: '#gameboard-container',

  components: {
    MorrisGame: MorrisGame
  },

  data()
  {
    return {
      //Game stats are are obtained from outside of the component to allow for
      //reusability. In a real-world application this might come from a database
      //e.g., after login, for now this is just mocked with localStorage.
      winStats: [
        parseInt(localStorage.getItem('player0_wins') || 0),
        parseInt(localStorage.getItem('player1_wins') || 0)
      ]
    };
  },

  methods: {
    updateStats: function(playerWins)
    {
      localStorage.setItem('player0_wins',playerWins[0]);
      localStorage.setItem('player1_wins',playerWins[1]);
    }
  }
});
