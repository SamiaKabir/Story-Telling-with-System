var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
// var nami = require("./nami");

// nami.a();



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

    users.push(socket.username);
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });


    var output = null;
    var line= data;

    console.log(data)
    // Local suggestion : Just try to add something relevant
    // Try to preserve the most likely causal event.
    // Remove punctuation, like 's and ., these mess with word checking

   // console.log(storyChars);
    // Local suggestion : Just try to add something relevant
    // Remove punctuation, like 's and ., these mess with word checking
    line = line.replace(/[^\w\s]/g, ' ');
    refChar = checkCharacter(line);
    if (refChar != null && storyChars.contains(refChar) == false) {
        storyChars.push(refChar);
    }
    console.log(storyChars);

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
        } else if (checkWord(line, 'scores') || checkWord(line, 'scored') || checkWord(line, 'basket') || checkWord(line, 'shot')) {
            output = 'Did you see that shot?, ' + refChar + ' exclaimed!';
        }
    }
    // Global suggestion : Goal is to finish a game of basketball, seems really complicated and unlikely to succeed return later
    // Generic Sentences
    if (output == null) {
        genericSentences = createGenericSentences();
        output = getRandArrayElem(genericSentences);
    }
 

 
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

