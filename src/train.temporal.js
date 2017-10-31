import {TemporalDifferenceReinforcementAgent} from './ai/TemporalDifferenceReinforcementAgent.js';
import {NineMensMorrisGameConfiguration} from './game/NineMensMorrisGameConfiguration.js';
import {AgentWrapper} from './helpers/AgentWrapper.js';

import commandLineArgs from 'command-line-args';

const fs = require('fs');
const path = require('path');

const mkdirSync = function (dirPath) {
  try {
    fs.mkdirSync(dirPath);
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

const optionDefinitions = [
  { name: 'outDirectory', alias: 'v', type: String, defaultValue: 'nn_out/' },
  { name: 'writeEach', alias: 'n', type: Number, defaultValue: 100 }
];

const options = commandLineArgs(optionDefinitions);

const outdir = path.resolve(options.outDirectory);
mkdirSync(outdir);

let agent = new  TemporalDifferenceReinforcementAgent();

const startConfig = new NineMensMorrisGameConfiguration([0,0],[0,0]);

console.log(options);

const increments = options.writeEach;
let i = options.writeEach;

for(let network of agent.train(startConfig,0,increments))
{
  let filename = path.join(outdir,`trained_${i}.json`);
  let output = JSON.stringify(network);

  fs.writeFileSync(filename, output);
  i += increments;
}
