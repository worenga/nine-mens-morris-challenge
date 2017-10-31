import {Agent} from './Agent.js';

export class WorkerProxyAgent extends Agent
{

  constructor(options)
  {
    super();
    this.worker = new Worker(options.bundle);
    this.options = options;
    this.worker.postMessage(["setOptions",options.agent_options]);
  }

  setOptions(options)
  {
    this.worker.postMessage(["setOptions",options]);
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
