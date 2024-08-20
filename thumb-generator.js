const config = {
	title: 'Fix Plotter',
	image_link: 'https://giovanirubim.github.io/fix-plotter/img/thumb.png',
	description: 'Automatic fix plotting for celestial navigation',
	link: 'https://giovanirubim.github.io/fix-plotter/',
	width: '800',
	height: '600',
};

const html = `
	<meta property="og:title" content="{title}"/>
	<meta property="og:image" content="{image_link}"/>
	<meta property="og:description" content="{description}"/>
	<meta property="og:url" content="{link}"/>
	<meta property="og:image:width" content="{width}"/>
	<meta property="og:image:height" content="{height}"/>
	<meta property="og:type" content="website"/>
`.trim().replace(/\s*\n\s*/g, '\n').replace(/\{\w+\}/g, (str) => {
	const attr = str.replace(/[\{\}]/g, '');
	return config[attr];
});

console.log(html);