import { InputError } from './error.js';
import * as ANGLE from './str-angle.js';
import * as CHART from './chart.js';
import * as OUTPUT from './output.js';
import { calcHc, calcZn } from './formulas.js';

const newSight = () => ({
	name: null,
	ho:   null,
	dec:  null,
	gha:  null,
	dataCount: 0,
});

const fixData = {
	ap: [ NaN, NaN ],
	sights: [{
		name: '',
		ho:  NaN,
		dec: NaN,
		gha: NaN,
		dataCount: 0,
	}],
	lops: [],
};

const commands = [{
	pattern: /^\s*AP:/i,
	run: function (line) {
		if (fixData.ap.length !== 0) {
			throw new InputError('Duplicated AP');
		}
		const arg = line.replace(this.pattern, '').trim();
		const [ latText, lonText ] = arg.split(', ');
		const lat = ANGLE.parseLatitude(latText);
		const lon = ANGLE.parseLongitude(lonText);
		if (lat == null || lon == null) {
			throw new InputError('Invalid coordinates for the AP');
		}
		fixData.ap.push(lat, lon);
	},
}, {
	pattern: /^\s*-\s*Name:/i,
	run: function (line) {
		if (fixData.sights.length > 0) {
			const last = fixData.sights.at(-1);
			if (last.dataCount < 4) {
				throw new InputError('Sight with missing information');
			}
		}
		const name = line.replace(this.pattern, '').trim();
		const sight = newSight();
		sight.name = name;
		sight.dataCount = 1;
		fixData.sights.push(sight);
	},
}, {
	pattern: /^\s*Ho:/i,
	run: function (line) {
		const sight = fixData.sights.at(-1);
		if (!sight) {
			throw new InputError('Unexpected Ho');
		}
		if (sight.ho !== null) {
			throw new InputError('Duplicated Ho');
		}
		const arg = line.replace(this.pattern, '').trim();
		const ho = ANGLE.parseAngle(arg);
		if (ho == null) {
			throw new InputError(`Invalid value for Ho: "${arg}"`);
		}
		sight.ho = ho;
		sight.dataCount += 1;
	},
}, {
	pattern: /^\s*Dec:/i,
	run: function (line) {
		const sight = fixData.sights.at(-1);
		if (!sight) {
			throw new InputError('Unexpected Dec');
		}
		if (sight.dec !== null) {
			throw new InputError('Duplicated Dec');
		}
		const arg = line.replace(this.pattern, '').trim();
		const dec = ANGLE.parseAngle(arg);
		if (dec == null) {
			throw new InputError(`Invalid value for Dec: "${arg}"`);
		}
		sight.dec = dec;
		sight.dataCount += 1;
	},
}, {
	pattern: /^\s*GHA:/i,
	run: function (line) {
		const sight = fixData.sights.at(-1);
		if (!sight) {
			throw new InputError('Unexpected GHA');
		}
		if (sight.gha !== null) {
			throw new InputError('Duplicated GHA');
		}
		const arg = line.replace(this.pattern, '').trim();
		const gha = ANGLE.parseAngle(arg);
		if (gha == null) {
			throw new InputError(`Invalid value for GHA: "${arg}"`);
		}
		sight.gha = gha;
		sight.dataCount += 1;
	},
}];

const initialize = () => {
	fixData.ap.length = 0;
	fixData.sights.length = 0;
	fixData.lops.length = 0;
	CHART.clear();
	OUTPUT.clear();
};

const validateData = () => {
	if (fixData.ap.length === 0) {
		throw new InputError(`Missing AP`);
	}
	if (fixData.sights.length === 0) {
		throw new InputError(`Input at least one sight`);
	}
	const last = fixData.sights.at(-1);
	if (last.dataCount < 4) {
		throw new InputError('Sight with missing information');
	}
};

const runFix = () => {
	const [ apLat, apLon ] = fixData.ap;
	fixData.sights.forEach((sight, i) => {;

		OUTPUT.addTitle(sight.name);

		let lha = sight.gha + apLon;
		let lhaCalc;
		if (apLon >= 0) {
			const ghaStr = ANGLE.stringifyAngle(sight.gha);
			const lonStr = ANGLE.stringifyAngle(apLon);
			lhaCalc = `LHA = ${ghaStr} + ${lonStr}`;
		} else {
			const ghaStr = ANGLE.stringifyAngle(sight.gha);
			const lonStr = ANGLE.stringifyAngle(Math.abs(apLon));
			lhaCalc = `LHA = ${ghaStr} - ${lonStr}`;
		}
		lhaCalc += ` = ` + ANGLE.stringifyAngle(lha);
		
		OUTPUT.addLine(lhaCalc);
		
		if (lha >= 360) {
			const old = ANGLE.stringifyAngle(lha);
			lha -= 360;
			const res = ANGLE.stringifyAngle(lha);
			OUTPUT.addLine(`LHA = ${old} - 360° = ${res}`);
		}

		if (lha < 0) {
			const old = ANGLE.stringifyAngle(Math.abs(lha));
			lha += 360;
			const res = ANGLE.stringifyAngle(lha);
			OUTPUT.addLine(`LHA = 360° - ${old} = ${res}`);
		}

		const zn = calcZn(apLat, sight.dec, lha);
		const hc = calcHc(apLat, sight.dec, lha);
		const dh = sight.ho - hc;
		const lopDir = dh >= 0 ? 'towards the GP' : 'away from the GP';

		OUTPUT.addLine(`Ho = ${ANGLE.stringifyAngle(sight.ho)}`);
		OUTPUT.addLine(`Zn = ${ANGLE.stringifyAngle(zn)} (computed)`);
		OUTPUT.addLine(`Hc = ${ANGLE.stringifyAngle(hc)} (computed)`);
		OUTPUT.addLine(`Ho - Hc = ${ANGLE.stringifyAngle(dh)} (${lopDir})`);

		if (dh >= 0) {
			CHART.drawAzimuth(zn, sight.name, false, i);
		} else {
			CHART.drawAzimuth(zn + 180, sight.name, true, i);
		}
		const lop = CHART.drawLOP(zn, dh, i);
		fixData.lops.push(lop);
	});

	CHART.intersect(fixData.lops, apLat);
};

export const runCode = (code) => {
	initialize();

	const lines = code.split('\n');

	for (let line of lines) {
		if (line.trim() === '') {
			continue;
		}
		const command = commands.find(command => {
			return command.pattern.test(line);
		});
		if (!command) {
			throw new InputError(`Invalid command line: "${line.trim()}"`);
		}
		command.run(line);
	}

	validateData();

	runFix();
};
