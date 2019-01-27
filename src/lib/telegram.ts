import Telegraf from 'telegraf';

import {
	getLocation,
	getTopRestaurants,
	getNearbyRestaurantsAndLocation,
	convertToFloat
} from '.';

const bot = new Telegraf(cfg('telegram.token'));

async function init() {
	const botInfo = await bot.telegram.getMe();
	bot.options.username = botInfo.username;
	Oak.info('Server has initialized bot username.', botInfo.username);
	bot.startPolling();
}

// error handler
bot.use(async (ctx, next) => {
	const start = Oak.time();
	if (!next) return;
	try {
		await next();
	}
	catch(err) {
		Oak.error('Response error', err);
	}
	Oak.timeEnd(start, 'Response Time');
});

bot.on('inline_query', async (ctx) => {
	if (!ctx.update.inline_query) return;
	const query = ctx.update.inline_query;
	const searchQuery = _.trim(query.query).toLowerCase();
	let location;
	let result: any = [];

	const isNearQuery = searchQuery.includes('near ');
	const nearSearchTerm = isNearQuery ? searchQuery.slice(searchQuery.indexOf('near ') + 5) : '';

	if (isNearQuery && nearSearchTerm) {
		location = await getLocation(nearSearchTerm, query.location);

		// Query starts with 'near' only then return top restaurants near that place
		if (searchQuery.indexOf('near ') === 0) {
			const top = await getTopRestaurants(location);
			result = top.map((r) => {
				const restaurant = r.restaurant;
				return {
					type: 'venue',
					id: restaurant.id,
					latitude: convertToFloat(restaurant.location.latitude),
					longitude: convertToFloat(restaurant.location.longitude),
					title: restaurant.name,
					address: `${restaurant.location.address}, ${restaurant.location.city}`,
					thumb_url: restaurant.thumb,
				};
			});
		}
	}
	else if (query.location) {
		const nearby = await getNearbyRestaurantsAndLocation(query.location.latitude, query.location.longitude);
		location = nearby.location;

		// If no search query return nearby restaurants
		if(!searchQuery) {
			result = nearby.restaurants.map((r) => {
				const restaurant = r.restaurant;
				return {
					type: 'venue',
					id: restaurant.id,
					latitude: convertToFloat(restaurant.location.latitude),
					longitude: convertToFloat(restaurant.location.longitude),
					title: restaurant.name,
					address: `${restaurant.location.address}, ${restaurant.location.city}`,
					thumb_url: restaurant.thumb,
				};
			});
		}
	}

	await ctx.answerInlineQuery(result);
});

export default init;