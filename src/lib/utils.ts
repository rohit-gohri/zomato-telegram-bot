export function convertToFloat(num: string | number) {
	if (typeof num === 'number') return num;
	return Number.parseFloat(num);
}