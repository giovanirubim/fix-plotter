import { cos, sin, toRad } from './trig.js';
import * as ANGLE from './str-angle.js';
import * as VEC from './vec-math.js';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const colors = {
	background: '#2c2c2c',
	chartLines: '#666666',
	index: [ '#55ffaa', '#55aaff', '#ffaa55' ],
};

let degToPx = NaN;
let margin = NaN;
let origin = [ NaN, NaN ];

const drawAzimuthCircle = () => {
	const [ cx, cy ] = origin;

	const rad = 1 * degToPx;
	const gap = rad * 0.02;
	ctx.beginPath();
	ctx.arc(cx, cy, rad, 0, toRad(360));
	ctx.stroke();

	ctx.font = rad * 0.05 + 'px arial';
	ctx.textAlign = 'center';
	const minLine = 0.02 * rad;
	const midLine = 0.03 * rad;
	const maxLine = 0.04 * rad;
	for (let i=0; i<360; ++i) {
		const len = { 0: maxLine, 5: midLine }[i % 10] ?? minLine;
		const a = - rad;
		const b = a + len;
		const c = b + gap;
		ctx.setTransform(1, 0, 0, 1, cx, cy);
		ctx.rotate(toRad(i));
		ctx.beginPath();
		ctx.moveTo(0, a);
		ctx.lineTo(0, b);
		ctx.stroke();
		if (i % 10 !== 0) {
			continue;
		}
		if (cos(i) >= 0) {
			ctx.textBaseline = 'top';
			ctx.fillText(i, 0, c);
		} else {
			ctx.textBaseline = 'bottom';
			ctx.setTransform(1, 0, 0, 1, cx, cy);
			ctx.rotate(toRad(i + 180));
			ctx.fillText(i, 0, - c);
		}
	}
	ctx.resetTransform();
};

const drawLatitudes = () => {
	const [ _cx, cy ] = origin;
	
	const ax = margin;
	const bx = canvas.width - margin;

	ctx.beginPath();
	for (let i=-1; i<=1; ++i) {
		ctx.moveTo(ax, cy + i * degToPx);
		ctx.lineTo(bx, cy + i * degToPx);
	}
	ctx.stroke();
};

const drawAPLongitude = () => {
	const [ cx ] = origin;
	ctx.beginPath();
	ctx.moveTo(cx, margin);
	ctx.lineTo(cx, canvas.height - margin);
	ctx.stroke();
};

export const clear = () => {
	const { width, height } = canvas;

	margin = 10;
	degToPx = Math.round(height * 0.35);
	origin = [
		Math.round(width * 0.5) - 0.5,
		Math.round(height * 0.5) - 0.5,
	];
	
	ctx.fillStyle = colors.background;
	ctx.fillRect(0, 0, width, height);

	ctx.fillStyle = colors.chartLines;
	ctx.strokeStyle = colors.chartLines;
	ctx.lineWidth = 1;
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';

	drawAzimuthCircle();
	drawLatitudes();
	drawAPLongitude();
};

const dirMarginIntersection = (ax, ay, dirX, dirY) => {
	const minX = margin;
	const maxX = canvas.width - margin;
	const minY = margin;
	const maxY = canvas.height - margin;
	
	let t = 0;
	
	// Top intersection
	const t1 = (minY - ay)/dirY;
	const t1x = ax + dirX*t1;
	if (t1x >= minX && t1x <= maxX) {
		t = Math.max(t, t1);
	}

	// Bottom intersection
	const t2 = (maxY - ay)/dirY;
	const t2x = ax + dirX*t2;
	if (t2x >= minX && t2x <= maxX) {
		t = Math.max(t, t2);
	}

	// Left intersection
	const t3 = (minX - ax)/dirX;
	const t3y = ay + dirY*t3;
	if (t3y >= minY && t3y <= maxY) {
		t = Math.max(t, t3);
	}

	// Right intersection
	const t4 = (maxX - ax)/dirX;
	const t4y = ay + dirY*t4;
	if (t4y >= minY && t4y <= maxY) {
		t = Math.max(t, t4);
	}

	return [ ax + dirX*t, ay + dirY*t ];
};

const drawArrowTip = (zn, rad) => {
	const angle = 35;
	const len = degToPx * 0.05;

	const x = 0;
	const y = - rad;

	const dx = sin(angle) * len;
	const dy = cos(angle) * len;

	ctx.setTransform(1, 0, 0, 1, ...origin);
	ctx.rotate(toRad(zn));
	ctx.beginPath();
	ctx.moveTo(x - dx, y + dy);
	ctx.lineTo(x, y);
	ctx.lineTo(x + dx, y + dy);
	ctx.stroke();
};

const calcDist = (ax, ay, bx, by) => {
	return Math.sqrt((ax - bx)**2 + (ay - by)**2);
};

export const drawLOP = (zn, dist) => {
	const dirX = sin(zn);
	const dirY = - cos(zn);
	const [ cx, cy ] = origin;
	const mx = cx + dirX*dist*degToPx;
	const my = cy + dirY*dist*degToPx;

	const [ ax, ay ] = dirMarginIntersection(mx, my, dirY, - dirX);
	const [ bx, by ] = dirMarginIntersection(mx, my, - dirY, dirX);

	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();

	return [ mx, my, dirY, - dirX ];
};

export const drawAzimuth = (zn, label, flipArrow, colorIndex) => {
	const dirX = sin(zn);
	const dirY = - cos(zn);
	const excess = degToPx * 0.1;
	const gap = degToPx * 0.05;

	const [ cx, cy ] = origin;
	const ax = cx - excess*dirX;
	const ay = cy - excess*dirY;
	const [ bx, by ] = dirMarginIntersection(cx, cy, dirX, dirY);

	const color = colors.index[colorIndex] ?? '#aaa';
	ctx.fillStyle = color;
	ctx.strokeStyle = color;

	ctx.setLineDash([ 5, 2 ]);
	ctx.beginPath();
	ctx.moveTo(ax, ay);
	ctx.lineTo(bx, by);
	ctx.stroke();
	ctx.setLineDash([]);

	ctx.font = degToPx * 0.065 + 'px arial';
	ctx.textBaseline = 'middle';
	ctx.setTransform(1, 0, 0, 1, cx, cy);

	const rot = (zn - 90);
	if (cos(rot) >= 0) {
		ctx.textAlign = 'right';
		ctx.rotate(toRad(rot));
		ctx.fillText(label, - excess - gap, 0);
		ctx.resetTransform();
	} else {
		ctx.textAlign = 'left';
		ctx.rotate(toRad(rot + 180));
		ctx.fillText(label, excess + gap, 0);
		ctx.resetTransform();
	}

	if (flipArrow) {
		drawArrowTip(zn + 180, calcDist(cx, cy, ax, ay));
	} else {
		drawArrowTip(zn, calcDist(cx, cy, bx, by));
	}
	ctx.resetTransform();
};

const getLOPPairIntersection = (a, b) => {
	let [ ax, ay, aDirX, aDirY ] = a;
	let [ bx, by, bDirX, bDirY ] = b;
	const cos = aDirX;
	const sin = aDirY;
	const cx = bx - ax;
	const cy = by - ay;
	const ry = cy*cos - cx*sin;
	const dy = bDirY*cos - bDirX*sin;
	const t = - ry/dy;
	return [ bx + t*bDirX, by + t*bDirY ];
};

const readFixAt = ([ x, y ], apLat) => {
	const [ cx, cy ] = origin;

	ctx.fillStyle = '#fff';
	ctx.strokeStyle = '#fff';

	ctx.beginPath();
	ctx.arc(x, y, 2, 0, Math.PI*2);
	ctx.fill();
	
	const dLat = (cy - y)/degToPx;
	const dLon = (x - cx)/degToPx/cos(apLat);

	ctx.beginPath();
	ctx.moveTo(x, cy);
	ctx.lineTo(x, y);
	ctx.moveTo(cx, y);
	ctx.lineTo(x, y);
	ctx.stroke();

	const gap = 5;

	ctx.textAlign = 'left';
	ctx.textBaseline = 'middle';
	ctx.fillText(ANGLE.stringifyAngle(Math.abs(dLat)), x + gap, (y + cy)*0.5);

	ctx.textAlign = 'center';
	ctx.textBaseline = 'bottom';
	ctx.fillText(ANGLE.stringifyAngle(Math.abs(dLon)), (x + cx)*0.5, y - gap);

	return [ dLat, dLon ];
};

const solveCockedHat = (a, b, c) => {
	const p1 = getLOPPairIntersection(a, b);
	const p2 = getLOPPairIntersection(a, c);
	const p3 = getLOPPairIntersection(b, c);

	const d1 = VEC.normal(
		VEC.sum(
			VEC.normal(VEC.sub(p2, p1)),
			VEC.normal(VEC.sub(p3, p1)),
		),
	);

	const d2 = VEC.normal(
		VEC.sum(
			VEC.normal(VEC.sub(p1, p2)),
			VEC.normal(VEC.sub(p3, p2)),
		),
	);

	return getLOPPairIntersection(
		[ ...p1, ...d1 ],
		[ ...p2, ...d2 ],
	);
};

export const intersect = (lops, apLat) => {
	if (lops.length === 2) {
		return readFixAt(getLOPPairIntersection(...lops), apLat);
	}
	if (lops.length === 3) {
		return readFixAt(solveCockedHat(...lops), apLat);
	}
	return null;
};
