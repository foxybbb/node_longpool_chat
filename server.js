const http = require('http');
const fs = require('fs');
var chat = require('./chat');
var url = require('url');
const HOSTNAME = '127.0.0.1';
const PORT = 3000;

const server = http.createServer(function (req, res) {
    var urlParsed = url.parse(req.url);

    switch (urlParsed.pathname) {
        case '/':
            sendFile("index.html", res);
            break;
        case '/subscribe':
            chat.subscribe(req, res);
            break;
        case '/publish':
            var body = '';

            req
                .on('data', function (body) {
                   

                    if (body.length > 1e4) {
                        res.statusCode = 413;
                        res.end("Your message is too big for my little chat");
                    }
                    console.log(body);
                   
                    try {
                        body = JSON.parse(body);
                        console.log(body);
                    } catch (e) {
                        res.statusCode = 400;
                        res.end("Bad Request");
                        return;
                    }

                    chat.publish(body.message);
                    res.end("ok");
             
                });
            break;

        default:
            res.statusCode = 404;
            res.end('404 Not found');
    }

});

function sendFile(fileName, res) {
    var fileStream = fs.createReadStream(fileName);
    fileStream
        .on('error', function () {
            res.statusCode = 500;
            res.end("Server error");
        })
        .pipe(res)
        .on('close', function () {
            fileStream.destroy();
        });
}


server.listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});