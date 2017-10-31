export class NineMensMorrisMove
{
  constructor( player, to, from=null, removedPiece=null )
  {
    this.player = player;
    this.from = from;
    this.to = to;
    this.removedPiece = removedPiece;
  }
}
