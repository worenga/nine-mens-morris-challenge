import {NineMensMorrisMove} from './NineMensMorrisMove.js';
import {NineMensMorrisGameConfiguration} from './NineMensMorrisGameConfiguration.js';
import {EventEmitter} from '../helpers/EventEmitter.js';

export class NineMensMorrisGame extends EventEmitter
{

	static get PLAYER_WHITE( ) { return 0; }
  static get PLAYER_BLACK() { return 1; }

	constructor( stones = [0,0], removedStones = [0,0] )
	{
		super();
		this.initializationParams = { stones: stones, removedStones: removedStones };
		this.configuration = new NineMensMorrisGameConfiguration(stones,removedStones);
		this.moves = [];
	}

	//Reset the Game to its initial State
	reset()
	{
		this.triggerEvent("game:beforereset");

		this.configuration = new NineMensMorrisGameConfiguration(
			this.initializationParams.stones,
			this.initializationParams.removedStones
		);

		this.moves = [];
		this.triggerEvent("boardstate:changed",null);
		this.triggerEvent("game:reset");
		this._proceedOrEndGame();

	}

	//Check whether Player can make a move or not (false, if not)
	playerAllowedToMove(player,from,to)
	{

		//Note: configuration is turn-independent, check if
		//whether its the current turn for the player.

		if(this.currentTurn != player)
		{
			console.log('no turn');
			return false;
		}

		//Redirect to Game Configuration...
		return this.configuration.playerAllowedToMove( ...arguments );
	}

	//
	createAndApplyMove( player, from, to, removedPiece=null )
	{
		if( this.playerAllowedToMove( player, from, to ) )
		{
			const move = new NineMensMorrisMove( player, to, from, removedPiece );
			this._persistsMoveUnsafe( move );
			return true;
		}
		else
		{
			return false;
		}
	}


	getLastMove()
	{
		if( this.moves.length === 0 )
		{
			return null;
		}
		else
		{
			return this.moves[ this.moves.length - 1 ];
		}
	}


	undoLastMove( amount=1 )
	{
		let movesLeftToUndo = amount;

		while( movesLeftToUndo > 0 )
		{
			movesLeftToUndo--;
			let lastMove = this.moves.pop();

			if( lastMove )
			{
				this.configuration.undoMove( lastMove );
				this.triggerEvent( "move:undone", lastMove );
			}
			else
			{
				break;
			}

		}

		this.triggerEvent('boardstate:changed');
		this._proceedOrEndGame();
	}


	applyMove( move )
	{

		if(this.playerAllowedToMove(move.player,move.from,move.to))
		{

			const requiresRemoval = this.configuration.moveRequiresRemoval(
					move.player,
					move.from,
					move.to
			);

			if(requiresRemoval)
			{

				if(this.configuration.getRemovablePiecesForPlayer(move.player)
															.indexOf(move.removedPiece) === -1)
				{
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


	_isMoveWiseDraw()
	{
		//Reached the same position three times?
		let moveHashtable = {};
		let gameState = new NineMensMorrisGameConfiguration([0,0]);

		for( let i = 0; i < this.moves.length; i++ )
		{
			gameState = gameState.constructFollowUpConfiguration( i % 2, this.moves[i] );
			const lookup = moveHashtable[gameState.getStringRepr()];
			if( !lookup )
			{
				moveHashtable[gameState.getStringRepr()] = 1;
			}
			else
			{
				if( ++moveHashtable[gameState.getStringRepr()] > 3 )
				{
					return {draw: true, type: 'position-wise'};
				}
			}
		}


		//No mill during the last 50 moves?
		const LOOKBACK = 50;

		if( this.moves.length < LOOKBACK )
		{
			return false;
		}
		else
		{
			let millFound = false;
			for( let i = this.moves.length - LOOKBACK; i < this.moves.length; i++ )
			{
				if(this.moves[i].removedPiece !== null)
				{

					millFound = true;
					break;
				}
			}
			if( !millFound )
			{
				return {draw: true, type: 'move-wise'};
			}
			else
			{
				return {draw: false};
			}
		}
	}


	_getDrawResult()
	{
			if( this.configuration.isDraw() )
			{
				return {draw: true, type:'no-move'};
			}
			else
			{
				return this._isMoveWiseDraw();
			}
	}


	_proceedOrEndGame()
	{
		const whiteWon = this.configuration.hasWon(NineMensMorrisGame.PLAYER_WHITE);
		const blackWon = this.configuration.hasWon(NineMensMorrisGame.PLAYER_BLACK);
		const drawResult = this._getDrawResult();

		//Check whether the game configuration indicates a draw, or wheter
		//we reached a move-wise draw (50 moves without a mill
		// or three repetitions of the same move)
		if( whiteWon || blackWon )
		{
			this.triggerEvent('game:ended', false,
				whiteWon ? NineMensMorrisGame.PLAYER_WHITE : NineMensMorrisGame.PLAYER_BLACK
			);
		}
		else if( drawResult.draw )
		{
			this.triggerEvent('game:ended', true, undefined, drawResult.type);
		}
		else
		{
			this.triggerEvent('move:move_required', this.currentTurn);
		}
	}


	removeStone( position )
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
