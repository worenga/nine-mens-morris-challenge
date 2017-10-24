import {negMod, bitCount, getSetBitIndices} from '../helpers/Util.js';
import {NineMensMorrisMove} from './NineMensMorrisMove.js';

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

/*
  Data structure for our mill game:

  We represent the board state with where the nth bit (from the right) is
  encoded according the following schematic:


  0--------------1-------------2    <--  (outer) ring 0
  |              |             |
  |      8-------9------10     |   <--  (inner) ring 1
  |      |       |       |     |
  |      |  16--17--18   |     |  <--  (innermost) ring 2
  |      |   |       |   |     |
  |      |   |       |   |     |
  7-----15--23      19--11-----3
  |      |   |       |   |     |
  |      |   |       |   |     |
  |      |  22--21--20   |     |
  |      |       |       |     |
  |     14------13------12     |
  |              |             |
  6--------------5-------------4

*/

export class NineMensMorrisGameConfiguration
{
  static get PHASE1() { return 1; }
  static get PHASE2() { return 2; }
  static get PHASE3() { return 3; }

  constructor(stones,removedStones)
  {
    this.stones = Object.assign({}, stones);
    this.removedStones = Object.assign({}, removedStones);
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

  undoMove(move)
  {
    if(move.from !== null)
    {
      this.stones[move.player] |= (1 << move.from);
    }

    this.stones[move.player] &= ~(1 << move.to);

    if(move.removedPiece !== null)
    {
      const opponent = 1 - move.player;
      this.stones[opponent] |= (1 << move.removedPiece);
      this.removedStones[opponent]--;
    }

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
    return getSetBitIndices(this.stones[player],24);
  }

  removeStone(player,position)
  {
      this.stones[player] &= ~(1 << position);
      this.removedStones[player] += 1;
  }

  getNumberOfClosedMillsForPlayer(player)
	{
		return this.getClosedMillsIndicesForPlayer(player).length;
	}

  getConfigurationHash()
  {

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


  getPhaseForPlayer(player)
	{
		const amountStones = this.getAmountStones(player);
		const removedStones = this.getNumberOfRemovedStones(player);
		if (amountStones+removedStones < 9)
		{
			return NineMensMorrisGameConfiguration.PHASE1;
		}
		else if(amountStones > 3 && removedStones < 6)
		{
			return NineMensMorrisGameConfiguration.PHASE2;
		}
		else
		{
			return NineMensMorrisGameConfiguration.PHASE3;
		}

	}


  isDraw()
  {
    return (this.playerCanMove(0) === false &&
            this.playerCanMove(1) === false );
  }


  hasWon(player)
  {
    const opponent = 1 - player;
    return (this.getRemovedStonesForPlayer(opponent) > 6 ||
            this.playerCanMove(opponent) === false );
  }


  playerAllowedToMove(player,from,to)
	{
		const opponent = 1 - player;

		const playerPhase = this.getPhaseForPlayer(player);

		if (from === to || from > 23 || from < 0 || to > 23 || to < 0)
		{
	    return false;
	  }

		if(from === null && playerPhase !== NineMensMorrisGameConfiguration.PHASE1)
		{
			return false;
		}

		if(from !== null && playerPhase === NineMensMorrisGameConfiguration.PHASE1)
		{
			return false;
		}

		if(from !== null && this.spotIsFree(from))
		{
			return false;
		}

		if(!this.spotIsFree(to))
		{
			return false;
		}

		if(playerPhase === NineMensMorrisGameConfiguration.PHASE2)
		{
			//Each node has at least two adjacent neighbors at the ring:
			const fromRing = Math.floor(from / 8);
			const fromRingPos = from % 8;
			const fromRingPosLeft  = fromRing * 8 + ((fromRingPos+1) % 8);
			const fromRingPosRight = fromRing * 8 + negMod(fromRingPos-1,8);

			if (to === fromRingPosLeft || to === fromRingPosRight) {
				return true;
			}

			if(from % 2)
			{
				//We also may have two other potential neighbors to check:

				// We furthmore need to check some
				// other positions outside of the current 'ring' from the other levels
				const fromRingUpperLevelPos = (fromRing+1)*8+((fromRingPos));
				const fromRingLowerLevelPos = (fromRing-1)*8+((fromRingPos));

				if(fromRingUpperLevelPos < 24 && fromRingUpperLevelPos === to)
				{
						return true;
				}

				if(fromRingLowerLevelPos >= 0 && fromRingLowerLevelPos === to) //Note
				{
						return true;
				}
			}

			return false;

		}

		return true;
	}

  playerCanMove(player)
  {
    const phase = this.getPhaseForPlayer(player);

    //If we are in Phase 1, it is clear that every player can move.
    if( phase === NineMensMorrisGameConfiguration.PHASE1)
    {
      return true;
    }
    else if(phase === NineMensMorrisGameConfiguration.PHASE2)
    {
      //We are in Phase 2 or 3, i.e. check to find any position that the player
      //is able to move without violating the constraints of the game
      const freePositions = this.getFreePositionVector();

      for ( let level=0; level < 2; level++ )
      {
        for ( let ringPos = 0; ringPos < 8; ringPos++ )
        {
          if(this.canBeMovedTo(freePositions,level,ringPos, player))
          {
            return true;
          }
        }
      }
    }
    else if(phase === NineMensMorrisGameConfiguration.PHASE3)
    {
      //Player can always move in Phase 3 there are not sufficient stones
      //to occupy all free positions:
      return true;
    }
    else
    {
      return false;
    }
  }

  encodePosToHumanReadable(pos)
  {
    //TODO: write this function and vice versa
    /*
    0, 7, 6 -> a
    8, 15, 14 -> b
    16, 23, 22 -> c
    1, 9, 17, 21, 13, 5 -> d
    18, 19, 20 -> e
    10, 11,12 -> f
    0, 1, 2 -> g
    */

    /*
    0, 1, 2 -> 7
    8, 9, 10 -> 6
    16, 17, 18 -> 5
    7, 15, 23, 19, 11, 3 -> 4
    22, 21, 20 -> 3
    14, 13, 12 -> 2
    6, 5, 4 -> 1
    */

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

  constructFollowUpConfiguration(player,move)
  {
    let config = new NineMensMorrisGameConfiguration(this.stones, this.removedStones);
    config.persistMove(move);
    return config;
  }

  * getSuccessorConfiguration(player)
  {
    //If we are in P1, we can essentially move anywhere where it is free:
    if(this.getPhaseForPlayer(player) == NineMensMorrisGameConfiguration.PHASE1)
    {
      const from = null;
      let targets = getSetBitIndices(this.getFreePositionVector(),24);

      for(let to of targets)
      {
        let tmpMove = new NineMensMorrisMove(player,to,from);

        if(this.moveRequiresRemoval(player,from,to))
        {
          let removables = this.getRemovablePiecesForPlayer(player);
          for(let removable of removables)
          {
            tmpMove.removedPiece = removable;
            yield {move: Object.assign({},tmpMove), configuration: this.constructFollowUpConfiguration(player,tmpMove)};
          }

        }
        else
        {
          yield {move: Object.assign({},tmpMove), configuration: this.constructFollowUpConfiguration(player,tmpMove)};
        }
      }

    }
    else if(this.getPhaseForPlayer(player) >= NineMensMorrisGameConfiguration.PHASE2)
    {
      const origins = getSetBitIndices(this.stones[player],24);
      const targets = getSetBitIndices(this.getFreePositionVector(),24);
      const removables = this.getRemovablePiecesForPlayer(player);

      for(let from of origins)
      {
        for(let to of targets)
        {
          if( !this.playerAllowedToMove(player,from,to) )
          {
            continue;
          }

          let tmpMove = new NineMensMorrisMove(player,to,from);

          if(this.moveRequiresRemoval(player,from,to))
          {

            for(let removable of removables)
            {
              tmpMove.removedPiece = removable;
              yield {move: Object.assign({},tmpMove), configuration: this.constructFollowUpConfiguration(player,tmpMove)};
            }

          }
          else
          {
            yield {move: Object.assign({},tmpMove), configuration: this.constructFollowUpConfiguration(player,tmpMove)};
          }

        }
      }
    }

  }
}
