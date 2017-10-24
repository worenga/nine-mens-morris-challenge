import {NineMensMorrisGameConfiguration} from './game/NineMensMorrisGameConfiguration.js';
import {NaiveRandomAgent} from './ai/NaiveRandomAgent.js';

let agent = new NaiveRandomAgent();

onmessage = function(oEvent) {
  const configuration = Object.assign(new NineMensMorrisGameConfiguration(),oEvent.data[1]);
  const player = oEvent.data[2];
  agent.getNextMove(configuration,player, function(computedMove) {
      postMessage(computedMove);
  });
};
