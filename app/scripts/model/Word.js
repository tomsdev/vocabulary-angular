/**
 * @class Describe Word object that we get from json.
 * @property {string} w The original word.
 * @property {string} t The word translation.
 * @property {string} d The description.
 * @property {{ad: number, qz: number, s: number}} inf Additional information:
 *           ad is the timestamp when the word was added.
 *           qz is the timestamp when the word was asked in a quiz the last time.
 *           s is the number of consecutive success for this word in a quiz.
 */
function Word() {
	this.w = "";
	this.t = "";
	this.d = "";
	this.inf = {
		ad: 0,
		qz: 0,
		s: 0
	};
}

/**
 * Create a json instance of a Word.
 * @return {Word}
 */
function createWord() {
	return {w:"", t:"", d:"", inf:{ad:0, qz:0, s:0}};
}

/**
 * Calculate the word score, it represents the knowledge of the word by the user.
 * Store it in word.inf.score .
 * @param {Word} word
 */
function computeWordScore(word) {
	word.inf.s = word.inf.s || 0;
	return word.inf.score =  word.inf.s;
}