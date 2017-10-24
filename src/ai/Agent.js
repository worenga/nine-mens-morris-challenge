export class Agent
{
  constructor()
  {}

  isHuman()
  {
    return false;
  }

  getNextMove(callback)
  {
    throw "Abstract Agent is not an KI oracle-agent";
  }
}
