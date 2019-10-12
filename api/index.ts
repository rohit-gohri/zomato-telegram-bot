import {NowRequest, NowResponse} from '@now/node';
import './_global';
import {startBot, getWebhookCallback} from './_lib';

// process.env.IS_NOW is undefined locally,
if (!process.env.IS_NOW) {
	startBot().then(() => {
		Oak.info('Started bot');
	});
  }
  
export default async (req: NowRequest, res: NowResponse) => {
	if (!req.method) return;
	
	if (req.method.toLowerCase()  !== 'post') {
		res.send(`ok ${req.method.toLowerCase()}`);
		return;
	}

	const handler = await getWebhookCallback();
	return handler(req, res);
};
