const http = require("http");
const URL = require("url");

const PORT = 3000;

// अपनी API key यहाँ मत लिखना
// बाद में environment variable से आएगी
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;

const server = http.createServer(async (req, res) => {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  // OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Test page
  if (req.method === "GET" && req.url === "/") {

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("🤖 My AI Server चालू है!");
    return;
  }

  // Web Search
  if (req.method === "POST" && req.url === "/web-search") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      try {

        const data = JSON.parse(body);

        const question = data.question;

        if (!question) {

          res.writeHead(400, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            error: "सवाल नहीं मिला"
          }));

          return;
        }

        if (!TINYFISH_API_KEY) {

          res.writeHead(500, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            error: "TinyFish API key server में सेट नहीं है"
          }));

          return;
        }

        const searchURL =
          "https://api.search.tinyfish.ai/?query=" +
          encodeURIComponent(question);

        const response = await fetch(searchURL, {

          method: "GET",

          headers: {
            "X-API-Key": TINYFISH_API_KEY
          }

        });

        const result = await response.json();

        if (!response.ok) {

          res.writeHead(response.status, {
            "Content-Type": "application/json; charset=utf-8"
          });

          res.end(JSON.stringify({
            error: "TinyFish Search में समस्या हुई",
            details: result
          }));

          return;
        }

        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8"
        });

        res.end(JSON.stringify(result));

      } catch (error) {

        res.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8"
        });

        res.end(JSON.stringify({
          error: "Server में समस्या हुई",
          details: error.message
        }));

      }

    });

    return;
  }

  // कोई दूसरा URL
  res.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  res.end("404 - Page नहीं मिला");

});

server.listen(PORT, () => {

  console.log(
    `🤖 My AI Server: http://localhost:${PORT}`
  );

});
