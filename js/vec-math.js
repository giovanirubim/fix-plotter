export const sum = ([ ax, ay ], [ bx, by ]) => {
	return [ ax + bx, ay + by ];
};

export const sub = ([ ax, ay ], [ bx, by ]) => {
	return [ ax - bx, ay - by ];
};

export const scale = ([ x, y ], scale) => {
	return [ x*scale, y*scale ];
};

export const len = ([ x, y ]) => {
	return Math.sqrt(x**2 + y**2);
};

export const normal = (v) => {
	return scale(v, 1/len(v));
};

export const dot = ([ ax, ay ], [ bx, by ]) => {
	return ax*bx + ay*by;
};
