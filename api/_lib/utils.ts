import { URL, URLSearchParams } from "url";

export function convertToFloat(num: string | number) {
	if (typeof num === 'number') return num;
	return Number.parseFloat(num);
}

export function convertRatingToStars(rating: number) {
	const originalRating = rating;
	let stars = '';
	while(rating > 0.5) {
		stars += '🌟';
		rating--;
	}
	return `${stars} (${originalRating}/5)`;
}

export function getMapsUrl(location: {latitude: string | number, longitude: string | number}) {
	const url = new URL('https://maps.google.com/maps/');
	url.search = new URLSearchParams({
		q: `${location.latitude},${location.longitude}`,
	}).toString();
	return url.toString();
}