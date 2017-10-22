import {NineMensMorrisMove} from './NineMensMorrisMove.js';
import {EventEmitter} from '../helpers/EventEmitter.js';
import {negMod, bitCount} from '../helpers/Util.js';

export class MorrisGame extends EventEmitter {


	constructor(stones = [0,0], removedStones = [0,0])
	{
		super();
		this.millBitmasks = [
			(1 << 0) | (1 << 1) | (1 << 2),
			(1 << 8) | (1 << 9) | (1 << 10),
			(1 << 16) | (1 << 17) | (1 << 18),
			(1 << 7) | (1 << 15) | (1 << 23),
			(1 << 19) | (1 << 11) | (1 << 3),
			(1 << 22) | (1 << 21) | (1 << 20),
			(1 << 14) | (1 << 13) | (1 << 12),
			(1 << 6) | (1 << 5) | (1 << 4),
			(1 << 0) | (1 << 7) | (1 << 6),
			(1 << 8) | (1 << 15) | (1 << 14),
			(1 << 16) | (1 << 23) | (1 << 22),
			(1 << 1) | (1 << 9) | (1 << 17),
			(1 << 21) | (1 << 13) | (1 << 5),
			(1 << 18) | (1 << 19) | (1 << 20),
			(1 << 10) | (1 << 11) | (1 << 12),
			(1 << 2) | (1 << 3) | (1 << 4)
		];

		/*
		  Data structure for our mill game:

			0--------------1-------------2  <  level 0
			|              |             |
			|      8-------9------10     |  <  level 1
			|      |       |       |     |
			|      |  16--17--18   |     |  <  level 2
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

			0-7  : Ring 0
			8-15 : Ring 1
			16-23: Ring 2

		*/

		this.stones = stones;
		this.removedStones = removedStones;
		this.moves = [];
	}

	  static get white() { return 0; }
	  static get black() { return 1; }
	  static get phase1() { return 1; }
	  static get phase2() { return 2; }
	  static get phase3() { return 3; }

	getClosedMillsIndices(player)
	{
		let foundMills = [];
		for(let millIndex = 0; millIndex < this.millBitmasks.length; millIndex++)
		{
			const currentMillMask = this.millBitmasks[millIndex];
			if((this.stones[player] & currentMillMask) === currentMillMask)
			{
				foundMills.push(millIndex);
			}
		}
		return foundMills;
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


	playerAllowedToMove(player,from,to)
	{

		const opponent = 1 - player;

		if(this.currentTurn != player)
		{
			return false;
		}

		if (from === to) {
	    return false;
	  }

		if(from === null && this.getPhaseForPlayer(player) !== MorrisGame.phase1)
		{
			return false;
		}

		if(from !== null && this.getPhaseForPlayer(player) === MorrisGame.phase1)
		{
			return false;
		}

		if(from !== null && (this.stones[player] >> from) & 1 !== 1)
		{
			return false;
		}

		const freePositions = ~(this.stones[player] | this.stones[opponent]);

		if(((freePositions >> to) & 1) !== 1)
		{
			return false;
		}

		if(this.getPhaseForPlayer(player) === MorrisGame.phase2)
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

	applyMove(player,from,to)
	{
		if(this.playerAllowedToMove(player,from,to))
		{
			let move = new NineMensMorrisMove(player,to,from);
			this._persistsMoveUnsafe(move);
			return true;
		}else{
			return false;
		}
	}

	_getMillHash(millIndices){
		let hash = 0;
		for(let millIdx of millIndices)
		{
			hash |= (1 << millIdx);
		}
		return hash;
	}

	_newMillClosed(previousMillHash,currentHash)
	{
		console.log(previousMillHash ^ currentHash,previousMillHash,currentHash);
		return ((previousMillHash ^ currentHash) !== 0) && bitCount(currentHash) >= bitCount(previousMillHash);
	}

	_persistsMoveUnsafe(move)
	{
		console.log("closed mills1",this.getClosedMillsIndices(move.player));
		const previousMillHash = this._getMillHash(this.getClosedMillsIndices(move.player));

		if(move.oldPosition !== null)
		{
			this.stones[move.player] &= ~(1 << move.oldPosition);
		}
		this.stones[move.player] |= (1 << move.newPosition);

		this.moves.push(move);

		console.log("closed mills2",this.getClosedMillsIndices(move.player));
		const currentMillHash = this._getMillHash(this.getClosedMillsIndices(move.player));

		//TODO: Encapsulate internal state.
		if(this._newMillClosed(previousMillHash,currentMillHash) && move.removedPiece === null)
		{
			this.raise('move:removal_required', move.player);
		}else{
			this._proceedOrEndGame();
		}
	}

	_proceedOrEndGame()
	{
		const whiteWon = this.hasWon(0);
		const blackWon = this.hasWon(1);
		if(this.isDraw())
		{
			this.raise('game:ended', true, undefined);
		}
		else if(whiteWon || blackWon)
		{
			this.raise('game:ended', false, whiteWon ? 0 : 1);
		}
		else
		{
			this.raise('move:move_required', this.currentTurn);
		}
	}


	removeStone(position)
	{

		let currentMove = this.moves[this.moves.length-1];
		const opponent = 1 - currentMove.player;
		currentMove.removedPiece = position;

		this.stones[opponent] &= ~(1 << position);
		this.removedStones[opponent] += 1;

		this._proceedOrEndGame();
	}

	posToHumanReadable(pos)
	{
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


	positionRemoveableForPlayer(pos,player)
	{
		const opponent = 1 - player;

		if( ((this.stones[player] >> pos) & 1) | (((this.stones[opponent] >> pos) & 1) === 0) )
		{
			//If there is no stone or player has occupied the place herself,
			//there is nothing to be removed
			return false;
		} else {
			return true;
		}

		//TODO check mills

	}


	isFinalConfiguration()
	{
		if ( bitCount(this.stones[ MorrisGame.white]) < 3 )
		{
		   return MorrisGame.black;
		}
		else if ( bitCount(this.stones[MorrisGame.black]) < 3 )
		{
			return MorrisGame.white;
		}
		else
		{
			return false;
		}
	}

	isDraw()
	{
		return (this.playerCanMove(MorrisGame.white) === false &&
					  this.playerCanMove(MorrisGame.black) === false );
	}

	hasWon(player)
	{
		const opponent = 1 - player;
		return this.removedStones[opponent] > 7 || this.playerCanMove(opponent) === false;
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

	getNumberOfMills(player)
	{
		let numberOfMills = 0;
		for(let level=0;level<2;level++)
		{
			const levelOffset = level*8;
			const offsetted = this.stones[player] >> level*8;
			numberOfMills += (offsetted & 0x11) === 0x11;
			numberOfMills += (offsetted & 0b11100) === 0b11100;
			numberOfMills += (offsetted & 0b11100000) === 0b11100000;
			numberOfMills += (offsetted & 0b11000001) === 0b11000001;
		}

		for(let rotation=0;rotation<8;rotation+=2)
		{
			const mask = (1 << 1+rotation | 1 << 9+rotation | 1 << 17+rotation);
			numberOfMills += this.stones[player] & mask === mask;
		}

		return numberOfMills;
	}



	playerCanMove(player)
	{
		const phase = this.getPhaseForPlayer(player);

		//If we are in Phase 1, it is clear that every player can move.
		if( phase === MorrisGame.phase1)
		{
			return true;
		}else{

			//We are in Phase 2 or 3, i.e. check to find any position that the player
			//is able to move without violating the constraints of the game
			const freePositions = ~(this.stones[0] | this.stones[1]);

			for(let level=0;level<2;level++)
			{
				for(let ringPos=0;ringPos<8;ringPos++)
				{
					const idx = level*8+ringPos;
					if((freePositions >> idx) & 1)
					{
						//Place is not occupied. Check neighboring ring nodes.
						//Each node has at least two adjacent neighbors at the ring:
						const ringPosLeft  = level * 8 + (ringPos + 1 ) % 8;
						const ringPosRight = level * 8 + negMod((ringPos - 1 ),8);

						if((this.stones[player] >> ringPosLeft)  & 1 ||
						   (this.stones[player] >> ringPosRight) & 1  )
						{
							return true;
						}

						if(ringPos % 2)
						{
							// We furthmore need to check some
							// other positions outside of the current 'ring' from the other levels
							const upperLevelPos = ( level + 1 ) * 8 + ringPos;
							const lowerLevelPos = ( level - 1 ) * 8 + ringPos;

							if(upperLevelPos < 24)
							{
								if((this.stones[player] >> upperLevelPos) & 1)
								{
									return true;
								}
							}
							if(lowerLevelPos >= 0) //Note
							{
								if((this.stones[player] >> lowerLevelPos) & 1)
								{
									return true;
								}
							}
						}

					}
				}
			}
		}
		return false;

	}



	getPhaseForPlayer(player)
	{
		//assert(player === MorrisGame.white || player === MorrisGame.black);

		const amountStones = bitCount(this.stones[player]);
		if (amountStones+this.removedStones[player] < 9)
		{
			console.log('p1',player);
			return MorrisGame.phase1;
		}
		else if(amountStones > 3 && this.removedStones[player] < 6)
		{
			console.log('p2',player,amountStones - this.removedStones[player]);
			return MorrisGame.phase2;
		}
		else
		{
			console.log('p3',player,amountStones - this.removedStones[player]);
			return MorrisGame.phase3;
		}
	}

	get currentTurn()
	{
		if( this.moves.length % 2 == 0 )
		{
			return MorrisGame.white;
		} else {
			return MorrisGame.black;
		}
	}


	getSuccessorConfigurations()
	{

	}

}
