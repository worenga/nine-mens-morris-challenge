import {AlphaBetaAgent} from './ai/AlphaBetaAgent.js';
import {AgentWrapper} from './helpers/AgentWrapper.js';

let agentWrapper = new AgentWrapper(new AlphaBetaAgent());
onmessage = agentWrapper.onMessage.bind(agentWrapper);
