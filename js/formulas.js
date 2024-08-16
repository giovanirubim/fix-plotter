import { asin, acos, sin, cos } from './trig.js';

const { sqrt } = Math;

export const calcHc = (lat, dec, lha) => {
	return asin(cos(lat)*cos(dec)*cos(lha) + sin(lat)*sin(dec));
};

export const calcZn = (lat, dec, lha) => {
	const a = cos(dec);
	const b = sin(dec)*cos(lat) - a*cos(lha)*sin(lat);
	const c = acos(b/sqrt(b**2 + (a*sin(lha))**2));
	return lha >= 180 ? c : 360 - c;
};
