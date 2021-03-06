var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
// var nami = require("./nami");

// nami.a();



var characters = ['Bart', 'Tom', 'Popeye', 'Spongebob', 'Jerry', 'Pikachu'];
var vehicles = ['car', 'bike', 'motorcycle', 'scooter', 'skateboard', 'rollerblades'];
var food = ['chips', 'cookies and milk', 'lemonade', 'rice and curry'];
var protagonist = getRandArrayElem(characters);
var places = ['his house', protagonist + '\'s house', getRandArrayElem(characters) + '\'s house.'];
var storyChars = [protagonist];
var points = ['two', 'three'];
var refChar = protagonist;



console.log(characters);
console.log(food);
function getRandArrayElem(array) {
    return array[Math.floor(Math.random()*array.length)];
}


function createGenericSentences() {
    var genericSentences = [];
    var character;
    var sent1 = getRandArrayElem(storyChars) + ' thought that this\'d be a great time for some ' + getRandArrayElem(food) + '!';
    genericSentences.push(sent1);
    // We are already at the protagonist's house, so him heading to his own house makes no sense!
    do {
        character = getRandArrayElem(characters);
    } while(character == protagonist);
    var sent2 = character + ' took his ' + getRandArrayElem(vehicles) + ' and headed to ' + getRandArrayElem(places) + '.';
    genericSentences.push(sent2);
    return genericSentences;
}

function createGameSentences(player) {
    // generic enough to work only with refChar, otherwise we'll have keep track of who all is playing!
    var gameSentences = [];
    var sent1 = player + ' passed the ball to ' + getRandArrayElem(storyChars) + ' who slipped past the defenders.';
    gameSentences.push(sent1);
    var sent2 = player + ' dribbles past ' + getRandArrayElem(storyChars) + ' and shoots for a ' + getRandArrayElem(points) + 'pointer.';
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




app.get('/', function(req, res){
res.sendFile(__dirname + '/index.html');
});


app.use('/images',express.static(path.join(__dirname+ '/images')));
app.use('/styles',express.static(path.join(__dirname+ '/styles')));
app.use('/scripts',express.static(path.join(__dirname+ '/scripts')));
app.use('/libraries',express.static(path.join(__dirname+ '/libraries')));
app.use('/avatars',express.static(path.join(__dirname+ '/avatars')));
// Routing
app.use(express.static(path.join(__dirname, 'public')));

var numUsers = 0;
var users=[];

io.emit('some event', { for: 'everyone' });

io.on('connection', function(socket){

  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('message', function (data) {
    // we tell the client to execute 'new message'
    var output = null;
    var line= data;

    console.log(data)
    // Local suggestion : Just try to add something relevant
    // Try to preserve the most likely causal event.
    // Remove punctuation, like 's and ., these mess with word checking
    line = line.replace(/[^\w\s]/g, ' ');
    refChar = checkCharacter(line);
    console.log(refChar);
    if (refChar != null) {
        storyChars.push(refChar);
    }

    if (refChar != null) {
        if (checkWord(line, 'yard') || checkWord(line, 'outside')) {
            output = refChar + ' saw the basketball lying in the yard.';
        } else if (checkWord(line, 'cookies') || checkWord(line, 'milk')) {
            output = refChar + ' realized that the milk makes the cookies especially yummy.';
        } else if (checkWord(line, 'lemonade')) {
            output = refChar + ' felt a sudden surge of energy after drinking the lemonade.';
        } else if (checkWord(line, 'dribbling') || checkWord('playing')) {
            gameSentences = createGameSentences(refChar);
            output = getRandArrayElem(gameSentences);  
        } else if (checkWord(line, 'passed') || checkWord(line, 'pass') || checkWord(line, 'passes')) {
            output = 'The pass gets blocked by ' + getRandArrayElem(storyChars);
        }
    }
    // Global suggestion : Goal is to finish a game of basketball, seems really complicated and unlikely to succeed return later
    // Generic Sentences
    if (output == null) {
        genericSentences = createGenericSentences();
        output = getRandArrayElem(genericSentences);
    }

    users.push(socket.username);
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });

 
    users.push('nami');
    socket.emit('system message', {
      username: 'nami',
      message: output
    });
   
    console.log(output);
  });





  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {

    socket.emit('login', {
      username: 'nami',
      message: 'It was a beautiful sunny day, ' + protagonist + ' thought as he looked outside through the window' 
    });
    //echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: 'nami',
      message: 'It was a beautiful sunny day, ' + protagonist + ' thought as he looked outside through the window' 
    });

  });



  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
});

});

http.listen(port, function(){
  console.log('listening on *:3000');
});

