import {NineMensMorrisGameConfiguration} from '../game/NineMensMorrisGameConfiguration.js';

export class AgentWrapper {
  constructor(agent) {
    this.agent = agent;
  }

  onMessage(oEvent) {
    if(oEvent.data[0] == "requestAgentMove")
    {
      const configuration = Object.assign(new NineMensMorrisGameConfiguration(),oEvent.data[1]);
      const player = oEvent.data[2];
      this.agent.getNextMove(configuration,player, function(computedMove) {
          postMessage(computedMove);
      });
    }
    else if (oEvent.data[0] == "requestReinitialization")
    {
      this.agent.newGame();
    }
  }

}
