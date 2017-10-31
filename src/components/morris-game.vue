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
              <button class="button is-medium is-info" @click="undo">
                <span class="icon is-medium">
                  <i class="fa fa-step-backward"></i>
                </span> <span>Undo Last Move</span></button>
            </div>

            <div class="control">
              <button class="button is-medium is-outlined" @click="reset">
                <span class="icon is-medium">
                  <i class="fa fa-fast-backward"></i>
                </span>
                <span>Reset</span> </button>
            </div>

            <div class="control">
              <button class="button is-medium is-danger" @click="resetWinStats">
                <span class="icon is-medium">
                  <i class="fa fa-trash-o"></i>
                </span>
                 <span>Clear Stats</span>
               </button>
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
