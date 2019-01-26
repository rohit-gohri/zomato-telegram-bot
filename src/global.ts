import {hostname} from 'os';
import {cfg} from 'sm-utils';
import {Oak} from '@smpx/oak';
import * as _ from 'lodash';

const {version} = require('../package.json');

cfg.file(`${__dirname}/../config.json`, {overwrite: true, ignoreErrors: false, ignoreNotFound: false});
cfg.file(`${__dirname}/../private/config.json`, {overwrite: false, ignoreErrors: false, ignoreNotFound: true});

global.cfg = cfg;
global._ = _;

Oak.installExceptionHandlers();
Oak.installExitHandlers();

Oak.setGlobalOptions({
	hostname: hostname(),
	app: 'boring_food_bot',
	pm2Id: process.env.pm_id || -1,
	version,
	env: _.pick(process.env, ['APP', 'NODE_ENV']),
	appName: process.env.name,
	level: 'silly', // default level
	table: 'log',
});

global.Oak = Oak;