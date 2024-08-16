const signParseMap = {
	N: +1, E: +1, n: +1, e: +1,
	S: -1, W: -1, s: -1, w: -1,
	'+': +1, '-': -1,
};

const parseSign = (str) => {
	return signParseMap[str];
};

const explodeTokens = (str, patterns) => {
	const tokens = [];
	while (str !== '') {
		const n = tokens.length;
		for (const regex of patterns) {
			const match = str.match(regex);
			if (!match) continue;
			tokens.push({ text: match[0], pattern: regex });
			str = str.replace(regex, '');
			break;
		}
		if (tokens.length === n) {
			return null;
		}
	}
	return tokens;
};

const REGEX = {
	prefixSign: /^[\+\-]/,
	
	prefixLat:  /^[NS\+\-]/g,
	suffixLat:  /[NS]$/g,

	prefixLon:  /^[EW\+\-]/g,
	suffixLon:  /[EW]$/g,
	
	number:     /^\d+(\.\d+)?/,
	separator:  /^(\s*[°'"]\s*|\s+)/,
};

const parityToPattern = [
	REGEX.number,
	REGEX.separator,
];

const units = `°'"`;

const generalParser = (str, prefixRegex = REGEX.prefixSign, suffixRegex) => {
	str = str.trim();

	const prefix = str.match(prefixRegex)?.[0];
	const suffix = suffixRegex && str.match(suffixRegex)?.[0];
	prefix && (str = str.replace(prefixRegex, '').trim());
	suffix && (str = str.replace(suffixRegex, '').trim());
	if (prefix && suffix) {
		return null;
	}
	const sign = parseSign(prefix || suffix || '+');

	const tokens = explodeTokens(str, [ REGEX.number, REGEX.separator ]);
	if (tokens === null || tokens.length > 6) {
		return null;
	}

	const numbers = [];
	const separators = [];

	for (let i=0; i<tokens.length; ++i) {
		const token = tokens[i];
		const pattern = parityToPattern[i % 2];
		if (pattern !== token.pattern) {
			return null;
		}
		if (pattern === REGEX.number) {
			numbers.push(Number(token.text));
		} else {
			separators.push(token.text.trim());
		}
	}

	if (separators.length < numbers.length) {
		separators.push('');
	}

	let sum = 0;
	let unitIndex = -1;
	for (let i=0; i<numbers.length; ++i) {
		const sep = separators[i];
		if (sep === '') {
			if (i === 0) {
				unitIndex = 0;
			} else {
				unitIndex ++;
			}
		} else {
			const i = units.indexOf(sep);
			if (i <= unitIndex) {
				return null;
			}
			unitIndex = i;
		}
		if (unitIndex >= units.length) {
			return null;
		}
		sum += numbers[i] * (60 ** -unitIndex);
	}

	return sum * sign;
};

export const parseAngle = (str) => {
	return generalParser(str, REGEX.prefixSign);
};

export const parseLatitude = (str) => {
	return generalParser(str, REGEX.prefixLat, REGEX.suffixLat);
};

export const parseLongitude = (str) => {
	return generalParser(str, REGEX.prefixLon, REGEX.suffixLon);
};

export const stringifyAngle = (value) => {
	const sign = value < 0 ? '-' : '';
	const totalMin = Number((Math.abs(value) * 60).toFixed(1));
	if (totalMin === 0) {
		return `0° 0.0'`;
	}
	const min = totalMin % 60;
	const deg = Math.round((totalMin - min) / 60);
	return `${sign}${deg}° ${min.toFixed(1)}'`;
};

export const stringifyLatitude = (value) => {
	const temp = stringifyAngle(value);
	if (temp[0] === '-') {
		return temp.replace('-', '') + ' S';
	}
	return temp + ' N';
};

export const stringifyLongitude = (value) => {
	const temp = stringifyAngle(value);
	if (temp[0] === '-') {
		return temp.replace('-', '') + ' W';
	}
	return temp + ' E';
};

export const stringifyAzimuth = (value) => {
	return Number(value.toFixed(1)) + '°';
};
