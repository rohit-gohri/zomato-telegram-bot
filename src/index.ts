import './global';
import {startBot, getWebhookCallback} from './lib';

// process.env.IS_NOW is undefined locally,
if (!process.env.IS_NOW) {
	startBot().then(() => {
		Oak.info('Started bot');
	});
  }
  
export default (req, res) => {
	return getWebhookCallback().then(cb => cb(req, res));
};
