import {Agent} from './Agent.js';

//The Worker Proxy Agent is a Wrapper for a WebWorker that executes the actual Agent.
//Note that in JS we cannot simply spawn a thread, this is why we have to use this as a
//Delegate.
export class WorkerProxyAgent extends Agent
{

  //The constructor expects a bundle argument that features the script name of
  //the worker to be invoked.
  constructor(options)
  {
    super();
    this.worker = new Worker(options.bundle);
    this.options = options;
    this.worker.postMessage(["setOptions",options.agent_options]);
  }

  //Delegate to the wrapped setOptions of the actual Agent
  setOptions(options)
  {
    this.worker.postMessage(["setOptions",options]);
  }

  //Delegate to the wrapped newGame of the actual Agent
  newGame()
  {
    this.worker.postMessage(["requestReinitialization"]);
  }

  //Delegate to the wrapped getNextMove of the actual Agent
  getNextMove(configuration,player,callback)
  {
    this.worker.onmessage = function(eData){
      callback(eData.data);
    };
    this.worker.postMessage(["requestAgentMove",configuration,player]);
  }

  //Necessary to avoid Zombie Workers.
  terminate()
  {
    this.worker.terminate();
  }

}
