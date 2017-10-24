import {Agent} from './Agent.js';

export class HumanAgent extends Agent
{
  isHuman()
  {
    return true;
  }

  getNextMove(callback)
  {
    throw "Human Player Agent is no an KI oracle-agent";
  }

}
