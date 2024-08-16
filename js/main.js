import { runCode } from './engine.js';
import { InputError } from './error.js';
import * as OUTPUT from './output.js';

const inputDOM = document.querySelector('#input');

// Height of eye: 5.5 m
// Index error: 0°01.5'
// Alphecca, 2024-06-17 11:32:38 UTC, 18°46.8'
// Pollux, 2024-06-17 11:34:50 UTC, 35°28.1'
// Rigil Kentaurus, 2024-06-17 11:37:01 UTC, 16°54.8'
// Dead reckoning: N 0.390222°, E 85.406225°
// Answer: S 0.277036°, E 85.657873° (0°42.8' off the DR)

// GP: N 26°37.9', E 154°33.6'
// GP: N 27°58', E 36°46.8'
// GP: S 60°56.2', E 139°50.8'

const defInput = [
	`AP: N 0, E 85`,
	``,
	`- Name: Alphecca`,
	`  Ho: 18°38.2'`,
	`  Dec: 26° 37.9'`,
	`  GHA: 205° 26.4'`,
	``,
	`- Name: Pollux`,
	`  Ho: 35°21'`,
	`  Dec: 27°58'`,
	`  GHA: 323° 13.2'`,
	``,
	// `- Name: Rigil Kent.`,
	// `  Ho: 16°45.9'`,
	// `  Dec: -60°56.2'`,
	// `  GHA: 220° 9.2`,
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
