import {MaxQAgent} from './ai/MaxQAgent.js';
import {AgentWrapper} from './helpers/AgentWrapper.js';

//Entry Point for Web Worker for MaxQAgent
let agentWrapper = new AgentWrapper(new MaxQAgent());
onmessage = agentWrapper.onMessage.bind(agentWrapper);
