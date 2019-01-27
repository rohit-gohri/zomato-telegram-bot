import Telegraf from 'telegraf';
import d from 'sm-utils/d';

import {
	getLocation,
	getTopRestaurants,
	getNearbyRestaurantsAndLocation,
	searchRestaurants,
	convertToFloat
} from '.';

const bot = new Telegraf(cfg('telegram.token'));

async function init() {
	const botInfo = await bot.telegram.getMe();
	bot.options.username = botInfo.username;
	Oak.info('Server has initialized bot username.', botInfo.username);
	bot.startPolling();
}

async function getRestaurants(query) {
	let searchQuery = _.trim(query.query).toLowerCase();
	let location;

	const isNearQuery = searchQuery.includes('near ');
	const nearSearchTerm = isNearQuery ? searchQuery.slice(searchQuery.indexOf('near ') + 5) : '';
	d(isNearQuery, nearSearchTerm, searchQuery);

	if (isNearQuery && nearSearchTerm) {
		location = await getLocation(nearSearchTerm, query.location);

		// Query starts with 'near' only then return top restaurants near that place
		if (searchQuery.indexOf('near ') === 0 && location) {
			return getTopRestaurants(location);
		}

		searchQuery = searchQuery.slice(0, searchQuery.indexOf('near '));
	}
	if (query.location && !location) {
		const nearby = await getNearbyRestaurantsAndLocation(query.location.latitude, query.location.longitude);
		location = nearby.location;

		// If no search query return nearby restaurants
		if(!searchQuery) return nearby.restaurants;
	}
	return searchRestaurants(searchQuery, location);
}

// error handler
bot.use(async (ctx, next) => {
	const start = Oak.time();
	if (!next) return;
	try {
		await next();
	}
	catch(err) {
		Oak.error(ctx.inlineQuery, 'Response error', err);
	}
	Oak.timeEnd(start, 'Response Time');
});

bot.on('inline_query', async (ctx) => {
	if (!ctx.update.inline_query) return;
	const query = ctx.update.inline_query;
	const restaurants = await getRestaurants(query);
	const result = restaurants.map((r) => {
		const restaurant = r.restaurant;
		return {
			type: 'venue',
			id: restaurant.id,
			latitude: convertToFloat(restaurant.location.latitude),
			longitude: convertToFloat(restaurant.location.longitude),
			title: restaurant.name,
			address: restaurant.location.address,
			thumb_url: restaurant.thumb,
		};
	});

	await ctx.answerInlineQuery(result);
});

export default init;