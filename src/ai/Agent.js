export class Agent
{
  constructor(game,player)
  {
    this.game = game;
    this.player = player;
  }

  isHuman()
  {
    return false;
  }

  getNextMove()
  {
    throw "Abstract Agent is not an KI oracle-agent";
  }
}
