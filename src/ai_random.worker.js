import {NaiveRandomAgent} from './ai/NaiveRandomAgent.js';
import {AgentWrapper} from './helpers/AgentWrapper.js';

//Entry Point for Web Worker for NaiveRandomAgent
let agentWrapper = new AgentWrapper(new NaiveRandomAgent());
onmessage = agentWrapper.onMessage.bind(agentWrapper);
