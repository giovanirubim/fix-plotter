import { runCode } from './engine.js';
import { InputError } from './error.js';
import * as OUTPUT from './output.js';

const inputDOM = document.querySelector('#input');
const defInput = [
	`AP: 1° S, 85° E`,
	``,
	`- Name: Alphecca`,
	`  Ho: 18° 38.2'`,
	`  Dec: 26° 37.9' N`,
	`  GHA: 205° 26.4'`,
	``,
	`- Name: Pollux`,
	`  Ho: 35° 21'`,
	`  Dec: 27° 58' N`,
	`  GHA: 323° 13.2'`,
	``,
	`- Name: Rigil Kent.`,
	`  Ho: 16° 45.9'`,
	`  Dec: 60° 56.2'S`,
	`  GHA: 220° 9.2`,
].join('\n');

const handleInput = () => {
	try {
		runCode(inputDOM.value);
	} catch(err) {
		if (err instanceof InputError) {
			OUTPUT.clear();
			OUTPUT.addLine(`Error: ${err.message}`)
		} else {
			throw err;
		}
	}
};

inputDOM.value = defInput;
inputDOM.addEventListener('input', handleInput);
handleInput();
