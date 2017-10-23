import {NineMensMorrisMove} from './NineMensMorrisMove.js';
import {EventEmitter} from '../helpers/EventEmitter.js';
import {negMod, bitCount} from '../helpers/Util.js';

export class MorrisGame extends EventEmitter {

	constructor(stones = [0,0], removedStones = [0,0])
	{
		super();

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

		this.millBitmasks = Object.freeze([
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
		]);

		this.stones = stones;
		this.removedStones = removedStones;
		this.moves = [];
	}

  static get PLAYER_WHITE( ) { return 0; }
  static get PLAYER_BLACK() { return 1; }
  static get PHASE1() { return 1; }
  static get PHASE2() { return 2; }
  static get PHASE3() { return 3; }

	getClosedMillsIndicesForStones(stones)
	{
		let foundMills = [];
		for(let millIndex = 0; millIndex < this.millBitmasks.length; millIndex++)
		{
			const currentMillMask = this.millBitmasks[millIndex];
			if((stones & currentMillMask) === currentMillMask)
			{
				foundMills.push(millIndex);
			}
		}
		return foundMills;
	}

	getClosedMillsIndicesForPlayer(player)
	{
		return this.getClosedMillsIndicesForStones(this.stones[player]);
	}

	isPartOfMill(position,player)
	{
		for(let millIndex = 0; millIndex < this.millBitmasks.length; millIndex++)
		{
			const currentMillMask = this.millBitmasks[millIndex];
			if((currentMillMask & (1 << position)) !== 0 &&
				 (this.stones[player] & currentMillMask) === currentMillMask)
			{
				return true;
			}
		}
		return false;
	}



	reset()
	{
		this.triggerEvent("game:beforereset");
		this.stones = [0,0];
		this.removedStones = [0,0];
		this.moves = [];
		this.triggerEvent("boardstate:changed");
		this.triggerEvent("game:reset");
		this._proceedOrEndGame();
	}


	playerAllowedToMove(player,from,to)
	{

		const opponent = 1 - player;

		if(this.currentTurn != player)
		{
			return false;
		}

		if (from === to || from > 23 || from < 0 || to > 23 || to < 0) {
	    return false;
	  }

		if(from === null && this.getPhaseForPlayer(player) !== MorrisGame.PHASE1)
		{
			return false;
		}

		if(from !== null && this.getPhaseForPlayer(player) === MorrisGame.PHASE1)
		{
			return false;
		}

		if(from !== null && ((this.stones[player] >> from) & 1) !== 1)
		{
			return false;
		}

		const freePositions = ~(this.stones[player] | this.stones[opponent]);

		if(((freePositions >> to) & 1) !== 1)
		{
			return false;
		}

		if(this.getPhaseForPlayer(player) === MorrisGame.PHASE2)
		{
			//Each node has at least two adjacent neighbors at the ring:
			const fromRing = Math.floor(from / 8);
			const fromRingPos = from % 8;
			const fromRingPosLeft  = fromRing * 8+((fromRingPos+1)%8);
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

	createAndApplyMove(player,from,to,removedPiece=null)
	{
		if(this.playerAllowedToMove(player,from,to))
		{
			let move = new NineMensMorrisMove(player,to,from,removedPiece);
			this._persistsMoveUnsafe(move);
			return true;
		}else{
			return false;
		}
	}

	getLastMove()
	{
		if(this.moves.length === 0)
		{
			return null;
		}
		else
		{
			return this.moves[this.moves.length-1];
		}
	}

	undoLastMove(amount=1)
	{
		let movesLeftToUndo = amount;
		while(movesLeftToUndo > 0)
		{
			movesLeftToUndo--;
			let lastMove = this.moves.pop();
			if(lastMove)
			{
				if(lastMove.from !== null)
				{
					this.stones[lastMove.player] |= (1 << lastMove.from);
				}

				this.stones[lastMove.player] &= ~(1 << lastMove.to);

				if(lastMove.removedPiece !== null)
				{
					const opponent = 1 - lastMove.player;
					this.stones[opponent] |= (1 << lastMove.removedPiece);
					this.removedStones[opponent]--;
				}
				this.triggerEvent("move:undone",lastMove);
			}
			else
			{
				break;
			}
		}
		this.triggerEvent('boardstate:changed');
		this._proceedOrEndGame();
	}


	applyMove(move)
	{

		if(this.playerAllowedToMove(move.player,move.from,move.to))
		{

			const requiresRemoval = this.moveRequiresRemoval(move.player,move.from,move.to);

			if(requiresRemoval)
			{

				if(this.getRemovablePiecesForPlayer(move.player).indexOf(move.removedPiece) === -1)
				{
					console.log("cannot remove",move);
					//Cannot remove this peace or has no removable piece.
					return false;
				}

			}

			this._persistsMoveUnsafe(move);

			return true;
		}
		else
		{
			return false;
		}
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


	_getMillHash(millIndices){
		let hash = 0;
		for(let millIdx of millIndices)
		{
			hash |= (1 << millIdx);
		}
		return hash;
	}


	_newMillClosed(beforeMoveHash,afterMoveHash)
	{
		return ((beforeMoveHash ^ afterMoveHash) !== 0) &&
						bitCount(afterMoveHash) >= bitCount(beforeMoveHash);
	}


	moveRequiresRemoval(player,from,to)
	{
		const beforeMove = this._getMillHash(this.getClosedMillsIndicesForPlayer(player));

		let tmp = this.stones[player];

		//Perform move on tmp:
		if(from !== null)
		{
			tmp &= ~(1 << from);
		}
		tmp |= (1 << to);

		const afterTmpMove = this._getMillHash(this.getClosedMillsIndicesForStones(tmp));

		return this._newMillClosed(beforeMove,afterTmpMove);
	}


	_persistsMoveUnsafe(move)
	{
		const millHashBeforeMove = this._getMillHash(this.getClosedMillsIndicesForPlayer(move.player));

		if(move.from !== null)
		{
			this.stones[move.player] &= ~(1 << move.from);
		}

		this.stones[move.player] |= (1 << move.to);

		if(move.removedPiece !== null)
		{
			const opponent = 1 - move.player;
			this._removeStoneUnsafe(opponent,move.removedPiece);
		}

		this.moves.push(move);

		const millHashAfterMove = this._getMillHash(this.getClosedMillsIndicesForPlayer(move.player));

		this.triggerEvent('boardstate:changed');

		if(this._newMillClosed(millHashBeforeMove,millHashAfterMove) && move.removedPiece === null)
		{
			this.triggerEvent('move:removal_required', move.player);
		}
		else
		{
			this._proceedOrEndGame();
		}
	}


	_proceedOrEndGame()
	{
		const whiteWon = this.hasWon(MorrisGame.PLAYER_WHITE);
		const blackWon = this.hasWon(MorrisGame.PLAYER_BLACK);

		if(this.isDraw())
		{
			this.triggerEvent('game:ended', true, undefined);
		}
		else if(whiteWon || blackWon)
		{
			this.triggerEvent('game:ended', false, whiteWon ? MorrisGame.PLAYER_WHITE : MorrisGame.PLAYER_BLACK);
		}
		else
		{
			this.triggerEvent('move:move_required', this.currentTurn);
		}
	}

	_removeStoneUnsafe(player,position)
	{
			this.stones[player] &= ~(1 << position);
			this.removedStones[player] += 1;
	}

	removeStone(position)
	{

		let currentMove = this.moves[this.moves.length-1];
		const opponent = 1 - currentMove.player;
		currentMove.removedPiece = position;
		this._removeStoneUnsafe(opponent,position);

		this.triggerEvent("boardstate:changed");
		this._proceedOrEndGame();
	}


	getRemovedStonesForPlayer(player)
	{
		return this.removedStones[player];
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


	isDraw()
	{
		return (this.playerCanMove(MorrisGame.PLAYER_WHITE) === false &&
					  this.playerCanMove(MorrisGame.PLAYER_BLACK) === false );
	}


	hasWon(player)
	{
		const opponent = 1 - player;
		return (this.removedStones[opponent] > 6 ||
					  this.playerCanMove(opponent) === false );
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


	getNumberOfClosedMillsForPlayer(player)
	{
		return this.getClosedMillsIndicesForPlayer(player).length;
	}


	playerCanMove(player)
	{
		const phase = this.getPhaseForPlayer(player);

		//If we are in Phase 1, it is clear that every player can move.
		if( phase === MorrisGame.PHASE1)
		{
			return true;
		}
		else if(phase === MorrisGame.PHASE2)
		{
			//We are in Phase 2 or 3, i.e. check to find any position that the player
			//is able to move without violating the constraints of the game
			const freePositions = ~(this.stones[0] | this.stones[1]);

			for ( let level=0; level < 2; level++ )
			{
				for ( let ringPos = 0; ringPos < 8; ringPos++ )
				{
					if(this._canBeMovedTo(freePositions,level,ringPos, player))
					{
						return true;
					}
				}
			}
		}
		else if(phase === MorrisGame.PHASE3)
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


	_canBeMovedTo(freePositions,level,ringPos,player)
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
		const amountStones = bitCount(this.stones[player]);

		if (amountStones+this.removedStones[player] < 9)
		{
			return MorrisGame.PHASE1;
		}
		else if(amountStones > 3 && this.removedStones[player] < 6)
		{
			return MorrisGame.PHASE2;
		}
		else
		{
			return MorrisGame.PHASE3;
		}

	}

	get currentTurn()
	{

		if( this.moves.length % 2 == 0 )
		{
			return MorrisGame.PLAYER_WHITE;
		}
		else
		{
			return MorrisGame.PLAYER_BLACK;
		}

	}

}
