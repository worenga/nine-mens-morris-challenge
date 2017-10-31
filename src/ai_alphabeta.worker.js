import {AlphaBetaAgent} from './ai/AlphaBetaAgent.js';
import {AgentWrapper} from './helpers/AgentWrapper.js';

//Entry Point for Web Worker for AlphaBetaAgent
let agentWrapper = new AgentWrapper(new AlphaBetaAgent());
onmessage = agentWrapper.onMessage.bind(agentWrapper);
