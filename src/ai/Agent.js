export class Agent
{
  constructor() {}

  newGame() {}

  isHuman()
  {
    return false;
  }

  getNextMove(callback)
  {
    throw "Abstract Agent is not an KI oracle-agent";
  }

  terminate() {}
}
