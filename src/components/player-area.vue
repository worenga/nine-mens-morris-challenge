<template>
  <div>

    <transition name="fade">
      <div class="triangle-border" v-bind:class="[isActive ? '' : 'hide_opacity']">
        <p class="heading has-text-centered n">Current Turn</p>
      </div>
    </transition>

    <div class="box is-warning is-focused">

      <p class="title has-text-centered">{{playerName}}
        <transition name="fade">
          <pulse-loader v-bind:class="[isThinking ? '' : 'hide_opacity']" color="red"></pulse-loader>
        </transition>
      </p>

      <div class="field is-horizontal">
        <div class="field-body">
          <div class="control">
            <div class="select is-small">
              <select @change="onAgentChange($event.target.value)">
                <option disabled value="">Please select one</option>
                <option v-for="option in availableAgents" :selected="option.id == selectedAgent" v-bind:value="option.id">
                  {{ option.name }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="level-item has-text-centered">
        <div>
          <p class="heading">Wins:</p>
          <p class="title">{{numberOfWins}}</p>
        </div>
      </div>

    </div>
  </div>
</template>



<script src="./player-area.js"></script>



<style lang="scss" scoped>
@import 'compass';
@import './fade.scss';
.hide_opacity {
  @include opacity(0);
}

.triangle-border .heading{
  margin-bottom:0;
}
.triangle-border {
  position:relative;
  padding:5px;
  margin:1em 0 em;
  border:5px solid #8c8a82;
  color:#333;
  background:#fff;
  -webkit-border-radius:10px;
  -moz-border-radius:10px;
  border-radius:10px;
}


.triangle-border:before {
  content:"";
  position:absolute;
  bottom:-20px;
  left:40px;
  border-width:20px 20px 0;
  border-style:solid;
  border-color:#8c8a82 transparent;
  display:block;
  width:0;
}

.triangle-border:after {
  content:"";
  position:absolute;
  bottom:-13px;
  left:47px;
  border-width:13px 13px 0;
  border-style:solid;
  border-color:#fff transparent;
  display:block;
  width:0;
}


</style>
