const dom = document.querySelector('#text');

export const clear = () => {
	dom.innerHTML = '';
};

export const addLine = (text) => {
	const line = document.createElement('div');
	line.innerText = text;
	dom.appendChild(line);
};

export const addHTML = (html) => {
	dom.innerHTML += html;
};
