import {cfg as CFG} from 'sm-utils';
import {Oak as OAK} from '@smpx/oak';
import lodash from 'lodash';

declare global {
	namespace NodeJS {
		interface Global {
			cfg: typeof CFG;
			Oak: typeof OAK;
			_: typeof lodash;
		}
	}
	const cfg: typeof CFG;
	const Oak: typeof OAK;
	const _: typeof lodash;
}