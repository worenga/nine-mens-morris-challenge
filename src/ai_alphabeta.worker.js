import {NineMensMorrisGameConfiguration} from './game/NineMensMorrisGameConfiguration.js';
import {AlphaBetaAgent} from './ai/AlphaBetaAgent.js';

let agent = new AlphaBetaAgent();

onmessage = function(oEvent) {
  const configuration = Object.assign(new NineMensMorrisGameConfiguration(),oEvent.data[1]);
  const player = oEvent.data[2];
  agent.getNextMove(configuration,player, function(computedMove) {
      postMessage(computedMove);
  });
};
