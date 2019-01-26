import './global';
import {startBot} from './lib';

startBot().then(() => {
	Oak.info('Started bot');
});