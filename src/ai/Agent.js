export class Agent
{
  constructor() {}

  newGame() {}

  setOptions(options) {}

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
