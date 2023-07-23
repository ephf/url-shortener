const { createServer } = require("http");
const { writeFile, createReadStream } = require("fs");
const urls = require("./url_map.json");

// const port = process.env.PORT ?? 80;
// RENDER
const port = 443;
const paths = ["/"];
const mime = { html: "text/html", css: "text/css", ico: "image/x-icon" };

const idgen = length => Array.from({ length }, () => "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890-_"[Math.random() * 36 | 0]).join("");

createServer((req, res) => {
    let url = req.url.split("?")[0];

    if(url.startsWith("/shorten") && req.method == "POST") {
        req.on("data", data => {
            const url = (new URLSearchParams(data.toString())).get("url");
            if(!url.match(/^https?:\/\/(\w+?\.)+?\w+?\/?.*?$/)) return res.writeHead(301, { "Location": `/?error=${encodeURI("invalid website")}` }).end();
            const id = idgen(5);
            urls[id] = url;
            writeFile("url_map.json", JSON.stringify(urls), () => res.writeHead(301, { "Location": `/?success=${id}` }).end());
        });
        return;
    }

    if(url == "/ping") return res.end("pong");

    if(url.substring(1) in urls) return res.writeHead(301, { "Location": urls[url.substring(1)] }).end();

    if(paths.includes(url)) url += ".html";
    res.setHeader("Content-Type", mime[url.split(".")[1]] ?? "text/plain").statusCode = 200;
    createReadStream(`views${url}`)
        .on("error", () => res.writeHead(301, { "Location": "/" }))
        .pipe(res)
}).listen(port, () => console.log(`listening on port ${port}`));

setInterval(() => fetch("https://surl.hs.vc/ping"), 3600 * 1000 * 20);
