import '../global';
import {URL, URLSearchParams} from 'url';
import {Connect, Str} from 'sm-utils';

const requestUrl = 'https://developers.zomato.com/api/v2.1';
const userKey: string = cfg('zomato.token');

namespace Zomato {
	export interface location {
		entity_type: 'city' | 'subzone' | 'zone' | 'landmark' | 'metro' | 'group';
		entity_id: number;
		title: string;
		latitude: number;
		longitude: number;
		city_id: number;
		city_name: string;
		country_id: number;
		country_name: string;
	};

	export interface restaurant {
		restaurant: {
			R: {
				res_id: number;
			};
			id: number;
			name: string;
			url: string;
			location: {
			  address: string;
			  locality: string;
			  city: string;
			  city_id: number;
			  latitude: string;
			  longitude: string;
			  zipcode: number;
			  country_id: number;
			};
			average_cost_for_two: number;
			price_range: number;
			currency: string;
			thumb: string;
			featured_image: string;
			photos_url: string;
			menu_url: string;
			events_url: string;
			user_rating: {
			  aggregate_rating: number;
			  rating_text: string;
			  rating_color: string;
			  votes: number;
			},
			has_online_delivery: boolean;
			is_delivering_now: boolean;
			has_table_booking: boolean;
			deeplink: string;
			cuisines: string;
			all_reviews_count: number;
			photo_count: number;
			phone_numbers: string;
		}
	};

	export interface locationDetails {
		location: location;
		/**
		 * IDs of nearby restaurants
		 */
		nearby_res: string[];
		top_cuisines: string[];
		subzone: string;
		subzone_id: number;
		best_rated_restaurant: restaurant[];
	};
}

export async function getLocation(query: string, options?: {latitude: number, longitude: number}): Promise<Zomato.location | null> {
	let latitude = 0;
	let longitude = 0;
	if (options) {
		({latitude, longitude} = options);
	}
	const url = new URL(`${requestUrl}/locations`);
	url.search = new URLSearchParams({
		query,
		latitude: latitude.toString(),
		longitude: longitude.toString(),
	}).toString();

	return new Connect()
		.get()
		.url(encodeURI(url.toString()))
		.header('user-key', userKey)
		.fetch().then((response) => {
			const body: any = Str.tryParseJson(response.body);
			if (!body) return null;
			return body.location_suggestions[0];
		});
}

export async function getTopRestaurants(location: Zomato.location): Promise<Zomato.restaurant[]> {
	const url = new URL(`${requestUrl}/location_details`);
	url.search = new URLSearchParams({
		entity_id: location.entity_id.toString(),
		entity_type: location.entity_type,
	}).toString();

	return new Connect()
		.get()
		.url(encodeURI(url.toString()))
		.header('user-key', userKey)
		.fetch()
		.then((response) => {
			const body: any = Str.tryParseJson(response.body);
			if (!body) return [];
			return body.best_rated_restaurant;
		});
}

export async function getNearbyRestaurantsAndLocation(latitude: number, longitude: number): Promise<{restaurants: Zomato.restaurant[], location: Zomato.location}> {
	const url = new URL(`${requestUrl}/geocode`);
	url.search = new URLSearchParams({
		lat: latitude.toString(),
		lon: longitude.toString(),
	}).toString();

	return new Connect()
		.get()
		.url(encodeURI(url.toString()))
		.header('user-key', userKey)
		.fetch().then((response) => {
			const body: any = Str.tryParseJson(response.body);
			if (!body) return {restaurants: [], location: null};
			return {
				restaurants: body.nearby_restaurants,
				location: body.location,
			};
		});
}

export async function searchRestaurants(q: string, location?: Zomato.location): Promise<Zomato.restaurant[]> {
	const url = new URL(`${requestUrl}/search`);
	const params: { [key: string]: string | string[] | undefined } = {q};

	if (location) {
		params.entity_id = location.entity_id.toString();
		params.entity_type = location.entity_type;
	}
	url.search = new URLSearchParams(params).toString();

	return new Connect()
		.get()
		.url(encodeURI(url.toString()))
		.header('user-key', userKey)
		.fetch().then((response) => {
			const body: any = Str.tryParseJson(response.body);
			if (!body) return [];
			return body.restaurants;
		});
}

export function getRestaurantUrl(restaurant: Zomato.restaurant) {
	return `http://zoma.to/r/${restaurant.restaurant.id}`;
}