const { PI } = Math;
export const toRad = (deg) => deg / 180 * PI;
export const toDeg = (rad) => rad / PI * 180;

export const sin = (deg) => Math.sin(toRad(deg));
export const cos = (deg) => Math.cos(toRad(deg));
export const tan = (deg) => Math.tan(toRad(deg));

export const asin = (sin) => toDeg(Math.asin(sin));
export const acos = (cos) => toDeg(Math.acos(cos));
export const atan = (tan) => toDeg(Math.atan(tan));
