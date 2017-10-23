
import {negMod, bitCount} from '../helpers/Util.js';

const millBitmasks = [
  ( 1 <<  0) | ( 1 <<  1) | ( 1 <<  2),
  ( 1 <<  8) | ( 1 <<  9) | ( 1 << 10),
  ( 1 << 16) | ( 1 << 17) | ( 1 << 18),
  ( 1 <<  7) | ( 1 << 15) | ( 1 << 23),
  ( 1 << 19) | ( 1 << 11) | ( 1 <<  3),
  ( 1 << 22) | ( 1 << 21) | ( 1 << 20),
  ( 1 << 14) | ( 1 << 13) | ( 1 << 12),
  ( 1 <<  6) | ( 1 <<  5) | ( 1 <<  4),
  ( 1 <<  0) | ( 1 <<  7) | ( 1 <<  6),
  ( 1 <<  8) | ( 1 << 15) | ( 1 << 14),
  ( 1 << 16) | ( 1 << 23) | ( 1 << 22),
  ( 1 <<  1) | ( 1 <<  9) | ( 1 << 17),
  ( 1 << 21) | ( 1 << 13) | ( 1 <<  5),
  ( 1 << 18) | ( 1 << 19) | ( 1 << 20),
  ( 1 << 10) | ( 1 << 11) | ( 1 << 12),
  ( 1 <<  2) | ( 1 <<  3) | ( 1 <<  4)
];


export class NineMensMorrisGameConfiguration
{
  constructor(stones,removedStones)
  {
    this.stones = stones;
    this.removedStones = removedStones;
  }


  static getClosedMillsIndicesForStones(stones)
	{
		let foundMills = [];
		for(let millIndex = 0; millIndex < millBitmasks.length; millIndex++)
		{
			const currentMillMask = millBitmasks[millIndex];
			if((stones & currentMillMask) === currentMillMask)
			{
				foundMills.push(millIndex);
			}
		}
		return foundMills;
	}


	getClosedMillsIndicesForPlayer(player)
	{
		return NineMensMorrisGameConfiguration.getClosedMillsIndicesForStones(this.stones[player]);
	}


  isPartOfMill(position,player)
	{
		for(let millIndex = 0; millIndex < millBitmasks.length; millIndex++)
		{
			const currentMillMask = millBitmasks[millIndex];
			if((currentMillMask & (1 << position)) !== 0 &&
				 (this.stones[player] & currentMillMask) === currentMillMask)
			{
				return true;
			}
		}
		return false;
	}

  persistMove(move)
  {
    if(move.from !== null)
    {
      this.stones[move.player] &= ~(1 << move.from);
    }

    this.stones[move.player] |= (1 << move.to);

    if(move.removedPiece !== null)
    {
      const opponent = 1 - move.player;
      this.removeStone(opponent,move.removedPiece);
    }
  }

  static getMillHash(millIndices)
  {
    let hash = 0;
    for(let millIdx of millIndices)
    {
      hash |= (1 << millIdx);
    }
    return hash;
  }

  static newMillClosed(beforeMoveHash,afterMoveHash)
  {
    return ((beforeMoveHash ^ afterMoveHash) !== 0) &&
            bitCount(afterMoveHash) >= bitCount(beforeMoveHash);
  }


  moveRequiresRemoval(player,from,to)
  {
    const beforeMove = NineMensMorrisGameConfiguration.getMillHash(
      NineMensMorrisGameConfiguration.getClosedMillsIndicesForStones(this.stones[player]));

    let tmp = this.stones[player];

    //Perform move on tmp:
    if(from !== null)
    {
      tmp &= ~(1 << from);
    }
    tmp |= (1 << to);

    const afterTmpMove = NineMensMorrisGameConfiguration.getMillHash(
      NineMensMorrisGameConfiguration.getClosedMillsIndicesForStones(tmp));

    return NineMensMorrisGameConfiguration.newMillClosed(beforeMove,afterTmpMove);
  }

  getFreePositionVector()
  {
    return ~(this.stones[0] | this.stones[1]);
  }

  spotIsFree(position)
  {
    return (((this.getFreePositionVector() >> position) & 1) === 1 );
  }

  getPositionsForPlayer(player)
  {
    let positionsIndices = [];
    for( let i=0; i<24 ;i++ )
    {
      if(((this.stones[player] >> i) & 1) === 1 )
      {
        positionsIndices.push(i);
      }
    }
    return positionsIndices;
  }

  removeStone(player,position)
  {
      this.stones[player] &= ~(1 << position);
      this.removedStones[player] += 1;
  }

  getNumberOfClosedMillsForPlayer(player)
	{
		return NineMensMorrisGameConfiguration.getClosedMillsIndicesForPlayer(player).length;
	}

  getAmountStones(player)
  {
    return bitCount(this.stones[player]);
  }

  getNumberOfRemovedStones(player)
  {
    return this.removedStones[player];
  }

  canBeMovedTo(freePositions,level,ringPos,player)
  {
    const idx = level * 8 + ringPos;
    if( (freePositions >> idx) & 1 )
    {
      //Place is not occupied. Check neighboring ring nodes.

      //Each node has at least two adjacent neighbors at its own ring:
      const ringPosLeft  = level * 8 + (ringPos + 1 ) % 8;
      const ringPosRight = level * 8 + negMod(ringPos - 1 ,8);

      if( ( this.stones[player] >> ringPosLeft )  & 1 ||
          ( this.stones[player] >> ringPosRight ) & 1  )
      {
        return true;
      }

      if( ringPos % 2 )
      {
        //We are at an intersection with either 3 or 4 neighbors:
        //We need to check additional neighbors outside of current ring
        const upperLevelPos = ( level + 1 ) * 8 + ringPos;
        const lowerLevelPos = ( level - 1 ) * 8 + ringPos;

        if( upperLevelPos < 24 )
        {
          if( ( this.stones[player] >> upperLevelPos ) & 1 )
          {
            return true;
          }
        }

        if(lowerLevelPos >= 0) //Note
        {
          if( (this.stones[player] >> lowerLevelPos) & 1 )
          {
            return true;
          }
        }
      }
    }
    return false;
  }


  getRemovablePiecesForPlayer(player)
  {
    const opponent = 1 - player;
    let removablePositions = [];
    for(let position = 0; position < 24; position++)
    {
      if((this.stones[opponent] >> position & 1) === 1 &&
         (this.isPartOfMill(position,opponent) === false))
      {
        removablePositions.push(position);
      }
    }

    //Special Case, if all stones are protected or final move.
    if(bitCount(this.stones[opponent]) > 2 && removablePositions.length === 0)
    {
      for(let i = 0; i< 24; i++)
      {
        if(((this.stones[opponent] >> i) &1) === 1)
        {
          removablePositions.push(i);
        }
      }
    }

    return removablePositions;
  }


  getRemovedStonesForPlayer(player)
	{
		return this.removedStones[player];
	}


}
