<template>

  <div>

    <div id="controls">

      <div class="level">
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

          <transition name="fade">
            <div v-show="showDrawMessage" class="over-canvas has-centered-text notification is-warning">
              <button class="delete" @click="showDrawMessage=false"></button>
              The game ended in a <strong>draw</strong>.

              <div v-if="drawType=='position-wise'">
                The same position was encountered 3 times.
              </div>

              <div v-if="drawType=='move-wise'">
                No mill has been closed within the last 50 moves.
              </div>

              <div v-if="drawType=='no-move'">
                Neither of both players can move.
              </div>

              <div class="buttons">
                <span class="is-pulled-right button is-small is-outlined" @click="reset">
                  <span class="icon is-medium">
                    <i class="fa fa-fast-backward"></i>
                  </span>
                  <span>New Game</span>
                </span>
              </div>
            </div>
          </transition>

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
            <div class="buttons is-centered">
              <button class="button is-medium is-info is-outlined" @click="undo">
                <span class="icon is-medium">
                  <i class="fa fa-step-backward"></i>
                </span> <span>Undo Last Move</span>
              </button>

              <button class="button is-medium is-outlined" @click="reset">
                <span class="icon is-medium">
                  <i class="fa fa-fast-backward"></i>
                </span>
                <span>New Game</span>
              </button>

              <button class="button is-medium is-danger is-outlined" @click="resetWinStats">
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



<style lang="scss" scoped>
@import './fade.scss';
@import 'compass';
.button_draw
{
  margin:0 auto;
}
.over-canvas
{
  position:absolute;
  @include opacity(0.97);
  top: 490px;
  width: 500px;
}
</style>
