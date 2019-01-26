import Telegraf from 'telegraf';

const bot = new Telegraf(cfg('telegram.token'));

async function init() {
	const botInfo = await bot.telegram.getMe();
	bot.options.username = botInfo.username;
	Oak.info('Server has initialized bot username.', botInfo.username);
	bot.startPolling();
}

bot.use(async (ctx, next) => {
	const start = Oak.time();
	if (!next) return;
	await next();
	Oak.timeEnd(start, 'Response Time');
});

bot.on('inline_query', async (ctx) => {
	Oak.log({label: 'New query'}, ctx.update.inline_query)
});

export default init;