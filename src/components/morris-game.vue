<template>

  <div>

    <div id="controls">

      <div class="level is-mobile">
        <div class="level-left">
          <player-area
            :numberOfWins='numberOfWins[0]'
            :isThinking='isThinking[0]'
            :is-active='activePlayer == 0'
            :availableAgents="availableAgents"
            playerName="White"
            :selectedAgent="selectedAgent[0].id"
            v-on:agent-change="changeActiveAgent(0,...arguments)"
            />
        </div>

        <div class="level-item">
          <canvas id="gameboard"></canvas>
        </div>

        <div class="level-right">
          <player-area
            :numberOfWins='numberOfWins[1]'
            :isThinking='isThinking[1]'
            :is-active='activePlayer == 1'
            :availableAgents="availableAgents"
            playerName="Black"
            :selectedAgent="selectedAgent[1].id"
            v-on:agent-change="changeActiveAgent(1,...arguments)"
            />
        </div>
      </div>

      <div class="level is-mobile">
        <div class="level-item">
          <div class="field is-grouped">
            <div class="control">
              <button class="button is-medium is-info" @click="undo"> Undo Last Move</button>
            </div>
            <div class="control">
              <button class="button is-medium is-info" @click="resetWinStats"> Reset Player Stats </button>
            </div>
            <div class="control">
              <button class="button is-medium is-info" @click="reset"> Reset </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

</template>




<script src="./morris-game.js"></script>



<style scoped>
  /* Write your styles for the component in here */
</style>
