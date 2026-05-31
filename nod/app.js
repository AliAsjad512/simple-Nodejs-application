const http = require("http");

let users = [
  { id: 1, name: "Ali" },
  { id: 2, name: "John" }
];

const server = http.createServer((req, res) => {

  // GET /
  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Welcome to Node API" }));
  }

  // GET /users
  else if (req.url === "/users" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  }

  // POST /users
  else if (req.url === "/users" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      const newUser = JSON.parse(body);
      users.push(newUser);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newUser));
    });
  }

  // Not found
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});