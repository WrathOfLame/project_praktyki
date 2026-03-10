const http = require('http');
const fs = require('fs');
const path = require('path');

http.createServer((req, res) => {
    if(req.url === '/') {
        const file = path.join(__dirname, 'index.html');
        fs.readFile(file, (err, data)=>{
            if(err){
                res.statusCode = 500;
                res.end('Server error')
                return
            }
            res.setHeader('Content-Type', 'text/html');
            res.end(data);
        })
    } else if (req.url === '/graph.js') {
        const file = path.join(__dirname, 'graph.js');
        fs.readFile(file, 'utf8', (err, data)=>{
            if(err){
                res.statusCode = 500;
                res.end('Server error')
                return
            }
            res.setHeader('Content-Type', 'application/javascript');
            res.end(data);
        })
    } else {
        res.statusCode = 404;
        res.end('Page not found');
    }
}).listen(5000);
