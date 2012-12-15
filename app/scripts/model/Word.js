/**
 * @class Describe Word object that we get from json
 * @property {string} w The original word.
 * @property {string} t The word translation.
 * @property {string} d The description.
 * @property {number} pc The percentage reflecting how much the user know this word
 */
function Word(w, t, d, pc) {
	this.w = w;
	this.t = t;
	this.d = d;
	this.pc = pc;
}
