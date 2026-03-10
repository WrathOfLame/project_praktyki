const http = require('http');
http.createServer((req, res) => {
    res.write('Hello Worlds\n');
    require('app.js');
    res.end();
}).listen(5000, 'localhost');
