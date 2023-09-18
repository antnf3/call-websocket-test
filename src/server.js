import express from "express";
import WebSocket from "ws";
import http from "http";
import path from "path";

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "/views"));
app.use("/public", express.static(path.join(__dirname, "/public")));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const makeMessage = (type, payload) => {
  return JSON.stringify({ type, payload });
};
const sockets = [];
wss.on("connection", (socket) => {
  console.log("Connected to Browser ✔");
  // socket["user"] = "anay";
  // sockets.push(socket);

  socket.on("message", (msg) => {
    const message = JSON.parse(msg.toString("utf-8"));
    switch (message.type) {
      case "login":
        socket["user"] = message.payload;
        sockets.push(socket);
        sockets.forEach((aSocket) => {
          aSocket.send(makeMessage(message.type, message.payload));
        });
        break;

      case "call":
        // console.log(message.payload);
        const { user, data } = message.payload;
        const userSocket = sockets.filter(
          (aSocket) => aSocket["user"] === user
        );
        // console.log(userSocket.length);
        if (userSocket.length > 0) {
          userSocket[0].send(makeMessage(message.type, data));
        }
        break;

      default:
        return;
    }
  });

  socket.on("close", () => {
    const index = sockets.findIndex(
      (aSocket) => aSocket["user"] === socket["user"]
    );
    if (index > -1) {
      sockets.splice(index, 1);
    }
    console.log("Disconnected from Browser ❌");
  });
});

server.listen(5396, () => console.log("listening on http://localhost:5396"));
