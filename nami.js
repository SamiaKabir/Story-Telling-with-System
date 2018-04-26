

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

var characters = ['Bart', 'Tom', 'Popeye', 'Spongebob', 'Jerry', 'Pikachu'];
var vehicles = ['car', 'bike', 'motorcycle', 'scooter', 'skateboard', 'rollerblades'];
var food = ['chips', 'cookies and milk', 'lemonade', 'rice and curry'];
var protagonist = getRandArrayElem(characters);
var places = ['his house', protagonist + '\'s house', getRandArrayElem(characters) + '\'s house.'];
var storyChars = [protagonist];
var points = ['two', 'three'];
var refChar = protagonist;
var invitedCount = 0;
var foodCount = 0;

function getRandArrayElem(array) {
    return array[Math.floor(Math.random()*array.length)];
}

function createGenericSentences() {
    var genericSentences = [];
    var character;
    if (foodCount < 2) {
        var sent1 = getRandArrayElem(storyChars) + ' thought that this\'d be a great time for some ' + getRandArrayElem(food) + '!';
        genericSentences.push(sent1);
    }
    if (storyChars.length < 3) {
        // We are already at the protagonist's house, so him heading to his own house makes no sense!
        do {
            character = getRandArrayElem(characters);
        } while(character == protagonist);
        var sent2 = character + ' took his ' + getRandArrayElem(vehicles) + ' and headed to ' + getRandArrayElem(places) + '.';
        genericSentences.push(sent2);
        invitedCount++;
    }
    // Need at least 3 people for a game!
    if (storyChars.length > 2) {
        sent3 = protagonist + ' picked up the basketball which was lying there and started dribbling.';
        genericSentences.push(sent3);
        sent4 = getRandArrayElem(storyChars) + ' picked up the basketball and passed it to ' + protagonist;
        genericSentences.push(sent4);
    }
    return genericSentences;
}

function createGameSentences(player) {
    // generic enough to work only with refChar, otherwise we'll have keep track of who all is playing!
    var gameSentences = [];
    var sent1 = player + ' passed the ball to ' + getRandArrayElem(storyChars) + '.';
    gameSentences.push(sent1);
    var sent2 = player + ' dribbled past ' + getRandArrayElem(storyChars) + ' and took a shot!';
    gameSentences.push(sent2);
    var sent3 = player + ' gets past ' + getRandArrayElem(storyChars) + ' and is now within shooting range!';
    gameSentences.push(sent3);
    return gameSentences;
}

function checkWord(line, word) {
    words = line.split(' ');
    for (i = 0; i < words.length; i++) {
        if (words[i] == word) {
            return true;
        }
    }
    return false;
}

function checkCharacter(line) {
    words = line.split(' ');
    for (i = 0; i < words.length; i++) {
        for (j = 0; j < characters.length; j++) {
            if (characters[j] == words[i]) {
                return words[i];
            }
            if (words[j] == 'he' || words[j] == 'He') {
                return refChar;
            }
        }
    }
    // All words checked, no character referenced
    return null;
}

var readline = require('readline');
var rl = readline.createInterface({
    input: process.stdin,
});

console.log('It\'s the perfect weather to be playing outside, ' + protagonist + ' thought as he gazed at the clear blue sky.');
rl.on('line', function(line){
    var output = null;
    console.log(storyChars);
    // Local suggestion : Just try to add something relevant
    // Remove punctuation, like 's and ., these mess with word checking
    line = line.replace(/[^\w\s]/g, ' ');
    refChar = checkCharacter(line);
    if (refChar != null && storyChars.contains(refChar) == false) {
        storyChars.push(refChar);
    }

    if (refChar != null) {
    // Try to preserve the most likely causal event.
        if (checkWord(line, 'cookies') || checkWord(line, 'milk')) {
            output = refChar + ' realized that the milk makes the cookies especially yummy.';
        } else if (checkWord(line, 'lemonade')) {
            output = refChar + ' drank the lemonade and felt a sudden surge of energy.';
        } else if (checkWord(line, 'yard') || checkWord(line, 'outside')) {
            output = refChar + ' saw the basketball lying in the yard.';
        } else if (checkWord(line, 'basketball')) {
            output = refChar + ' picked up the basketball and started dribbling.';
        } else if (checkWord(line, 'dribbling') || checkWord('playing') || checkWord('dribble') || checkWord('play')) {
            // Need at least 3 people for a game!
            if (storyChars.length > 2) {
                gameSentences = createGameSentences(refChar);
                output = getRandArrayElem(gameSentences);  
            }
        } else if (checkWord(line, 'passed') || checkWord(line, 'pass') || checkWord(line, 'passes')) {
            output = 'But the pass gets blocked by ' + getRandArrayElem(storyChars);
        } else if (checkWord(line, 'scores') || checkWord(line, 'scored')) {
            output = 'Did you see that shot?, ' + refChar + ' exclaimed!';
        }
    }
    // Global suggestion : Goal is to finish a game of basketball, seems really complicated and unlikely to succeed return later
    // Generic Sentences
    if (output == null) {
        genericSentences = createGenericSentences();
        output = getRandArrayElem(genericSentences);
    }
    console.log(output);
});

