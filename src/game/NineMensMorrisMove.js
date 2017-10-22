export class NineMensMorrisMove
{
  constructor(player,newPosition,oldPosition=null,removedPiece=null)
  {
    this.player = player;
    this.newPosition = newPosition;
    this.oldPosition = oldPosition;
    this.removedPiece = removedPiece;
  }
}
