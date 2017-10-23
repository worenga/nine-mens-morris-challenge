import {Agent} from './Agent.js';

export class HumanAgent extends Agent
{
  isHuman()
  {
    return true;
  }

  getNextMove()
  {
    throw "Human Player is no oracle-agent";
  }

}
