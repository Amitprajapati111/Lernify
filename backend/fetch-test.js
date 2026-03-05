const fs = require('fs');
fetch('https://learnify-backend-1jkh.onrender.com/api/live-classes/room/4b45174f-6134-4e40-9c7e-930167266a71')
    .then(r => r.text().then(t => fs.writeFileSync('http-result.txt', `Status: ${r.status}\nBody: ${t}`)))
    .catch(err => fs.writeFileSync('http-result.txt', err.stack));
