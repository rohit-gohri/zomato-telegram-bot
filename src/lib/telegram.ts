import Telegraf from 'telegraf';
import { InlineQueryResultVenue } from 'telegraf/typings/telegram-types';
import ua from 'universal-analytics';

import {
	getLocation,
	getTopRestaurants,
	getNearbyRestaurantsAndLocation,
	searchRestaurants,
	convertToFloat,
	convertRatingToStars,
	getRestaurantUrl,
	getMapsUrl,
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
	const offset = Number.parseInt(query.offset) || 0;
	const restaurants = await getRestaurants(query);

	const result: InlineQueryResultVenue[] = restaurants.slice(offset).map((r):InlineQueryResultVenue => {
		const restaurant = r.restaurant;
		return {
			input_message_content:{
				parse_mode: 'markdown',
				message_text:
					`Find this restaurant on Zomato:\n` +
					`[${restaurant.name}, ${restaurant.location.locality}]` +
					`(${getRestaurantUrl(r)})\n\n` +
					`*Location:* [Maps Url](${getMapsUrl(restaurant.location)})\n` +
					`*Rating:* ${convertRatingToStars(restaurant.user_rating.aggregate_rating)}\n` +
					`*Cost For Two:* ${restaurant.currency}${restaurant.average_cost_for_two}\n` +
					`*Cuisines:* ${restaurant.cuisines}\n`,
				disable_web_page_preview: true,
			},
			type: 'venue',
			id: restaurant.id.toString(),
			latitude: convertToFloat(restaurant.location.latitude),
			longitude: convertToFloat(restaurant.location.longitude),
			title: restaurant.name,
			address: restaurant.location.address,
			thumb_url: restaurant.thumb,
		};
	});

	const visitor = ua(cfg('trackingId'), {cid: String(ctx.update.inline_query.from.id), strictCidFormat: false})
	visitor.event({
		ec: 'inline query',
		ea: 'search',
		el: ctx.update.inline_query.query
	}).send();

	return ctx.answerInlineQuery(result.slice(0, 50), {
		next_offset: result.length > 50 ? String(offset + 50) : '',
		// cache_time: 0,
		// is_personal: true,
	});
});

bot.on('chosen_inline_result', async (ctx) => {
	if (!ctx.update.chosen_inline_result) return;

	const visitor = ua(cfg('trackingId'), {cid: String(ctx.update.chosen_inline_result.from.id), strictCidFormat: false})
	visitor.event({
		ec: 'inline query',
		ea: 'selected',
		el: ctx.update.chosen_inline_result.query,
		ev: ctx.update.chosen_inline_result.result_id
	}).send();
});

bot.on('message', async (ctx) => {
	if (!ctx.message || !ctx.message.from) return;

	const visitor = ua(cfg('trackingId'), {cid: String(ctx.message.from.id), strictCidFormat: false})

	visitor.event({
		ec: 'message',
		ea: 'received',
		el: ctx.message.text,
	}).send();

	return ctx.reply(`This is an inline bot, please invoke it by starting your message with: @${bot.options.username}`);
})

export default init;