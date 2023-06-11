const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs');

let counter = 0;
let intervalId = null;
const counterFilePath = './counter.txt';

// Read the counter value from the file if it exists
if (fs.existsSync(counterFilePath)) {
  const counterValue = fs.readFileSync(counterFilePath, 'utf8');
  counter = parseInt(counterValue, 10);
}

app.use(express.static('public'));

app.get('/counter', (req, res) => {
  res.json({ counter });
});

app.post('/start-counter', (req, res) => {
  if (!intervalId) {
    startCounter();
  }
  res.sendStatus(200);
});

app.post('/stop-counter', (req, res) => {
  if (intervalId) {
    stopCounter();
  }
  res.sendStatus(200);
});

function startCounter() {
  intervalId = setInterval(() => {
    counter++;
    io.emit('counter-update', counter);
    fs.writeFile(counterFilePath, counter.toString(), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }, 1000);
}

function stopCounter() {
  clearInterval(intervalId);
  intervalId = null;
}

io.on('connection', (socket) => {
  socket.emit('counter-update', counter);

  socket.on('disconnect', () => {
    // No action needed
  });
});

const port = 3000;
http.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
