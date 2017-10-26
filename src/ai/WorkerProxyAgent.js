import {NineMensMorrisMove} from '../game/NineMensMorrisMove.js';
import {MorrisGame} from '../game/NineMensMorrisGame.js';
import {getRandomInt} from '../helpers/Util.js';

import {Agent} from './Agent.js';

export class WorkerProxyAgent extends Agent
{

  constructor(options)
  {
    super();
    this.worker = new Worker(options.bundle);
  }

  newGame()
  {
    this.worker.postMessage(["requestReinitialization"]);
  }

  getNextMove(configuration,player,callback)
  {
    this.worker.onmessage = function(eData){
      callback(eData.data);
    };
    this.worker.postMessage(["requestAgentMove",configuration,player]);
  }

  terminate()
  {
    this.worker.terminate();
  }

}
