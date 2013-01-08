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
	this.text = "";
	this.translation = "";
	this.description = "";
	this.infos = {
		creationDate: 0,
		lastQuizDate: 0,
		success: 0,
		score: 0
	};
}

/**
 * Create a json instance of a Word.
 * @return {Word}
 */
function createWord() {
	return {
		text:"",
		translation:"",
		description:"",
		infos: {
			creationDate: 0,
			lastQuizDate: 0,
			success: 0,
			score: 0
		}
	};
}

/**
 * Calculate the word score, it represents the knowledge of the word by the user.
 * Store it in word.infos.score
 * @param {Word} word
 */
function updateWordScore(word) {
	word.infos.score =  word.infos.success * 25;
}