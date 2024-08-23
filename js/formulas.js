import { asin, acos, sin, cos } from './trig.js';

export const calcHc = (lat, dec, lha) => {
	return asin(cos(lat)*cos(dec)*cos(lha) + sin(lat)*sin(dec));
};

export const calcZn = (lat, dec, lha, hc) => {
	const t = acos((sin(dec)*cos(lat) - cos(dec)*cos(lha)*sin(lat))/cos(hc));
	return lha < 180 ? 360 - t : t;
};
