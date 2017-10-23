import {NineMensMorrisMove} from './NineMensMorrisMove.js';
import {NineMensMorrisGameConfiguration} from './NineMensMorrisGameConfiguration.js';
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

		this.configuration = new NineMensMorrisGameConfiguration(stones,removedStones);
		this.moves = [];
	}

  static get PLAYER_WHITE( ) { return 0; }
  static get PLAYER_BLACK() { return 1; }
  static get PHASE1() { return 1; }
  static get PHASE2() { return 2; }
  static get PHASE3() { return 3; }


	reset()
	{
		this.triggerEvent("game:beforereset");
		this.configuration = new NineMensMorrisGameConfiguration(stones,removedStones);
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

		const playerPhase = this.getPhaseForPlayer(player);

		if (from === to || from > 23 || from < 0 || to > 23 || to < 0)
		{
	    return false;
	  }

		if(from === null && playerPhase !== MorrisGame.PHASE1)
		{
			return false;
		}

		if(from !== null && playerPhase === MorrisGame.PHASE1)
		{
			return false;
		}

		if(from !== null && this.configuration.spotIsFree(from))
		{
			return false;
		}

		if(!this.configuration.spotIsFree(to))
		{
			return false;
		}

		if(playerPhase === MorrisGame.PHASE2)
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

			const requiresRemoval = this.configuration.moveRequiresRemoval(move.player,move.from,move.to);

			if(requiresRemoval)
			{

				if(this.configuration.getRemovablePiecesForPlayer(move.player).indexOf(move.removedPiece) === -1)
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

	getConfiguration()
	{
		return this.configuration;
	}

	_persistsMoveUnsafe(move)
	{
		const millHashBeforeMove = NineMensMorrisGameConfiguration.getMillHash(
			this.configuration.getClosedMillsIndicesForPlayer(move.player));

		this.configuration.persistMove(move);

		this.moves.push(move);

		const millHashAfterMove = NineMensMorrisGameConfiguration.getMillHash(
			this.configuration.getClosedMillsIndicesForPlayer(move.player));

		this.triggerEvent('boardstate:changed');

		if(NineMensMorrisGameConfiguration.newMillClosed(
				millHashBeforeMove,millHashAfterMove) && move.removedPiece === null)
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

	removeStone(position)
	{

		let currentMove = this.moves[this.moves.length-1];
		const opponent = 1 - currentMove.player;
		currentMove.removedPiece = position;
		this.configuration.removeStone(opponent,position);

		this.triggerEvent("boardstate:changed");
		this._proceedOrEndGame();
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
		return (this.configuration.getRemovedStonesForPlayer(opponent) > 6 ||
					  this.playerCanMove(opponent) === false );
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
			const freePositions = this.configuration.getFreePositionVector();

			for ( let level=0; level < 2; level++ )
			{
				for ( let ringPos = 0; ringPos < 8; ringPos++ )
				{
					if(this.configuration.canBeMovedTo(freePositions,level,ringPos, player))
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


	getPhaseForPlayer(player)
	{
		const amountStones = this.configuration.getAmountStones(player);
		const removedStones = this.configuration.getNumberOfRemovedStones(player);
		if (amountStones+removedStones < 9)
		{
			return MorrisGame.PHASE1;
		}
		else if(amountStones > 3 && removedStones < 6)
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
