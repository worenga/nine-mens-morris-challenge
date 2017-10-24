import {NineMensMorrisMove} from './NineMensMorrisMove.js';
import {NineMensMorrisGameConfiguration} from './NineMensMorrisGameConfiguration.js';
import {EventEmitter} from '../helpers/EventEmitter.js';

export class NineMensMorrisGame extends EventEmitter {

	constructor(stones = [0,0], removedStones = [0,0])
	{
		super();

		this.configuration = new NineMensMorrisGameConfiguration(stones,removedStones);
		this.moves = [];
	}

  static get PLAYER_WHITE( ) { return 0; }
  static get PLAYER_BLACK() { return 1; }

	reset()
	{
		this.triggerEvent("game:beforereset");
		this.configuration = new NineMensMorrisGameConfiguration([0,0],[0,0]);
		this.moves = [];
		this.triggerEvent("boardstate:changed");
		this.triggerEvent("game:reset");
		this._proceedOrEndGame();
	}

	playerAllowedToMove(player,from,to)
	{

		//Note: configuration is turn-independent, check if
		//whether its the current turn for the player.
		if(this.currentTurn != player)
		{
			console.log('no turn');
			return false;
		}

		return this.configuration.playerAllowedToMove(...arguments);
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
				this.configuration.undoMove(lastMove);
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
		const whiteWon = this.configuration.hasWon(NineMensMorrisGame.PLAYER_WHITE);
		const blackWon = this.configuration.hasWon(NineMensMorrisGame.PLAYER_BLACK);

		if(this.configuration.isDraw())
		{
			this.triggerEvent('game:ended', true, undefined);
		}
		else if(whiteWon || blackWon)
		{
			this.triggerEvent('game:ended', false, whiteWon ? NineMensMorrisGame.PLAYER_WHITE : NineMensMorrisGame.PLAYER_BLACK);
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


	get currentTurn()
	{

		if( this.moves.length % 2 == 0 )
		{
			return NineMensMorrisGame.PLAYER_WHITE;
		}
		else
		{
			return NineMensMorrisGame.PLAYER_BLACK;
		}

	}

}
