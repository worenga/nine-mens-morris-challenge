import {TemporalDifferenceReinforcementAgent} from './ai/TemporalDifferenceReinforcementAgent.js';
import {AgentWrapper} from './helpers/AgentWrapper.js';

//Entry Point for TemporalDifferenceReinforcementAgent
let agentWrapper = new AgentWrapper(new TemporalDifferenceReinforcementAgent());
onmessage = agentWrapper.onMessage.bind(agentWrapper);
