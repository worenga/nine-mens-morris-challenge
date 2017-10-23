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
}
