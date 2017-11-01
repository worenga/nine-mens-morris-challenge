//Loosely based on http://www.gm.fh-koeln.de/ciopwebpub/Kone15c.d/TR-TDgame_EN.pdf

import {NineMensMorrisGameConfiguration} from '../game/NineMensMorrisGameConfiguration.js';
import {NineMensMorrisMove} from '../game/NineMensMorrisMove.js';
import {getRandomInt, shuffle, getRandomSubarray} from '../helpers/Util.js';
import {Agent} from './Agent.js';


//Trained Neural Nets:
//No Take = Trained Neural Net that only relies on the final state as a reward
//Take = Trained Neural Net that receives rewards for taking stones.
import TrainedNetworkTakeReward200k from '../../assets/neural_nets/trained_220000_take_reward.neural_net.json';
import TrainedNetworkNoTakeReward200k from '../../assets/neural_nets/trained_200000_notake_reward.neural_net.json';
import TrainedNetworkTakeReward100k from '../../assets/neural_nets/trained_100000_take_reward.neural_net.json';
import TrainedNetworkNoTakeReward100k from '../../assets/neural_nets/trained_100000_notake_reward.neural_net.json';
import TrainedNetworkTakeReward50k from '../../assets/neural_nets/trained_50000_take_reward.neural_net.json';
import TrainedNetworkNoTakeReward50k from '../../assets/neural_nets/trained_50000_notake_reward.neural_net.json';


const TRAINED_NEURAL_NETS = {
  '50k-notake': TrainedNetworkNoTakeReward50k,
  '50k-take': TrainedNetworkTakeReward50k,

  '100k-notake': TrainedNetworkNoTakeReward100k,
  '100k-take': TrainedNetworkNoTakeReward100k,

  '200k-notake': TrainedNetworkNoTakeReward200k,
  '200k-take': TrainedNetworkTakeReward200k,
};


import synaptic from 'synaptic';
import {Neuron, Layer, Network, Trainer, Architect} from 'synaptic';


export class TemporalDifferenceReinforcementAgent extends Agent
{

  _initNN()
  {
    //Defines the architecture of our neural net (to train!).
    var inputLayer = new Layer(26);
    var hiddenLayer = new Layer(26*3);
		var hiddenLayer2 = new Layer(24);
    var outputLayer = new Layer(1);

    inputLayer.project(hiddenLayer);
		hiddenLayer.project(hiddenLayer2);
		hiddenLayer2.project(outputLayer);

		inputLayer.set({
			squash: Neuron.squash.ReLU,
		});

		hiddenLayer.set({
			squash: Neuron.squash.ReLU,
		});

		hiddenLayer2.set({
			squash: Neuron.squash.ReLU,
		});
		/*
		outputLayer.set({
			squash: Neuron.squash.IDENTITY,
		});*/

    this.network = new Network({
    	input: inputLayer,
    	hidden: [hiddenLayer,hiddenLayer2],
    	output: outputLayer
    });
  }

  reinitializeState()
  {
    this._initNN();
  }


  constructor()
  {
    super();

    //Discount Factor:
		this.GAMMA = 0.99;

    //Reward for Win
    this.SCORE_WIN = 1.0;
    //Reward for Draw.
    this.SCORE_DRAW = 0.5;
    //Reward if piece was taken from enemy
		this.SCORE_PIECE_TAKEN = 0.2;

		this.loaded = false;

    this._initNN();

  }


  setOptions(options)
  {
      this.options = options;
      if(this.options.neural_net && TRAINED_NEURAL_NETS[this.options.neural_net])
      {
        console.log("Using Network: ",this.options.neural_net);
        this.network = Network.fromJSON(TRAINED_NEURAL_NETS[this.options.neural_net]);
        this.loaded = true;
      }
  }

  //Objective function that qantifies an encountered game configuration
  _evaluateConfiguration( player, move, configuration )
  {

    const opponent = 1 - player;

    let score = 0;
    let isFinal = false;

    if(configuration.hasWon(opponent))
    {
      score = -this.SCORE_WIN;
      isFinal = true;
    }
    else if(configuration.hasWon(player))
    {
      score = this.SCORE_WIN;
      isFinal = true;
    }
    else if(configuration.isDraw())
    {
      score = SCORE_DRAW;
      isFinal = true;
    }
    else
    {

			if(move.removedPiece !== null)
			{
				score = this.SCORE_PIECE_TAKEN;
			}

    }
    return { score:score, isFinal:isFinal };
  }


  _toFeatureVector( configuration, player )
  {
    const opponent = 1 - player;
    const playerPositions = configuration.getPositionsForPlayer(player);
    const opponentPositions = configuration.getPositionsForPlayer(opponent);
		let inputs = [];
    for(let i=0; i<24; i++)
    {
      if(playerPositions.indexOf(i) !== -1)
      {
        inputs.push(0.5);
      }
			else if(opponentPositions.indexOf(i) !== -1)
			{
        inputs.push(1);
      }
			else
			{
        inputs.push(0);
      }
    }

    inputs.push(configuration.getRemovedStonesForPlayer(player)/10);
    inputs.push(configuration.getRemovedStonesForPlayer(opponent)/10);
    return inputs;
  }


	normalizeOutput(output)
	{
		return output * 2 - 1;
	}


	normalizeInput( input )
	{
		return (input + 1) / 2;
	}


  _evalNN( configuration, player )
  {
    const unifiedConfiguration = configuration.constructUnifiedConfiguration();
		return this.normalizeOutput(this.network.activate(this._toFeatureVector(unifiedConfiguration,player)));
  }


//Invoke this via:
//$ npm run train -- --outDirectory output_directory
	* train(configuration,player, yield_ever_n_episodes=100)
	{
		const INITIAL_EPSILON = 1.0;
		const FINAL_EPSILON = 0.2;

		const learningRate = 0.1;

		const lookBackBufferLength = 10000;
		const OBSERVE = 10000;

		let seen = 0;
		let lookBackBuffer = [];

		let eps = INITIAL_EPSILON;

		for(let episode = 0; ; episode++)
		{
	    let isFinal = false;
	    let currentPlayer = player;
	    let playerSign;

	    let currentConfiguration = configuration;
			console.log(episode,seen);

			//Train NN:
	    while( !isFinal )
	    {

				if (eps > FINAL_EPSILON && seen > OBSERVE)
				{
					eps -= (INITIAL_EPSILON - FINAL_EPSILON) / OBSERVE;
				}


				if(currentPlayer == player)
	      {
	        playerSign = 1;
	      }
	      else
	      {
	        playerSign = -1;
	      }


	      let followUpConfigurations = Array.from(currentConfiguration.
	        generateSuccessorConfiguration(currentPlayer));

				const q = Math.random();

	      let nextBestState = null;
	      if( q < eps )
	      {
	        nextBestState = getRandomSubarray(followUpConfigurations,1)[0];
	      }
	      else
	      {
	        let nextBestScore = null;
	        for(let followUpConfig of followUpConfigurations)
	        {
	          const evalResult = playerSign * (
							this.GAMMA * this._evalNN(followUpConfig.configuration,currentPlayer)  +
							this._evaluateConfiguration(currentPlayer,
																					followUpConfig.move,
																					followUpConfig.configuration).score
						);

						if(nextBestScore == null ||  evalResult > nextBestScore)
	          {
	            nextBestScore = evalResult;
	            nextBestState = followUpConfig;
	          }

	        }
	      }


				const nextStateEval =  this._evaluateConfiguration(currentPlayer,
																													 nextBestState.move,
																													 nextBestState.configuration);



				const nextStateScore = playerSign * nextStateEval.score;

				if(lookBackBuffer.length >= lookBackBufferLength)
				{
					lookBackBuffer.pop();
				}
				lookBackBuffer.unshift([playerSign, currentConfiguration, nextBestState, nextStateEval,currentPlayer]);

				seen += 1;

				if(seen > OBSERVE)
				{
					//Train NN:
					let sample = getRandomSubarray(lookBackBuffer,16);

					let trainingData = [];

					for(let sampled of sample)
					{
						let trainingObj = {};
						trainingObj.input = this._toFeatureVector(sampled[1],sampled[4]);

						if(sampled[3].isFinal)
						{
							trainingObj.output = [this.normalizeInput(sampled[0] * sampled[3].score,1)];
						}
						else
						{
							trainingObj.output = [
								this.normalizeInput(sampled[0] *
									Math.max(
										Math.min(
											(sampled[3].score +
											 			 this.GAMMA *
											  	 this._evalNN(sampled[2].configuration,sampled[4])),
											1),
										-1)
									)
								];
						}


						for(let i = 0; i<26;i++)
						{
							if(trainingObj.input[i] < 0)
							{
								console.log("input smaller 0");
							}
						}
						if(trainingObj.output[0] < 0)
						{
							console.log("output smaller 0");
						}

						trainingData.push(trainingObj);

					}

					let trainer = new Trainer(this.network);
					trainer.train(trainingData,{
						rate: learningRate,
						iterations: 2,
						error: 0.00001,
					});



				}

	      isFinal = nextStateEval.isFinal;

	      currentConfiguration = nextBestState.configuration;
	      currentPlayer = 1 - currentPlayer;

	    }
			console.log(`Episode: ${episode}, eps: ${eps}, seen: ${seen}, lookBackBuffer: ${lookBackBuffer.length}`);

			if(episode >= yield_ever_n_episodes && yield_ever_n_episodes % num_episodes == 0)
			{
				yield this.network;
			}
		}

	}

	_initialize()
	{
		this.loaded = true;
		this.network = Network.fromJSON(TrainedNetworkNoTakeReward200k);
	}

  getNextMove(configuration,player,callback)
  {

		if(!this.loaded)
		{
			this._initialize();
		}


		let followUpConfigurations = Array.from(configuration.
																				generateSuccessorConfiguration(player));

		let nextBestScore = null;
		let nextBestState = null;

    //For each follow-Up configuration ask the Neural Net whether it thinks its
    //future value is better.
		for(let followUpConfig of followUpConfigurations)
		{

			const evalResult =
				(this.GAMMA * this._evalNN( followUpConfig.configuration, player )  +
				this._evaluateConfiguration(player, followUpConfig.move, followUpConfig.configuration ).score );

			if(nextBestScore == null ||  evalResult > nextBestScore)
			{
				nextBestScore = evalResult;
				nextBestState = followUpConfig;
			}
		}

		callback(nextBestState.move);

  }

}
