import {NaiveRandomAgent} from './ai/NaiveRandomAgent.js';
import {AgentWrapper} from './helpers/AgentWrapper.js';

let agentWrapper = new AgentWrapper(new NaiveRandomAgent());
onmessage = agentWrapper.onMessage.bind(agentWrapper);
