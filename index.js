var express = require("express");
var app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
var server = require("http").createServer(app);
var io = require("socket.io")(server);

server.listen(3000);
console.log("Server running at http://127.0.0.1:3000");

// Init global users variable
var users = [];

// Socket listen event "connection" from client
io.on("connection", (socket) => {
    console.log("A client connected with socket id: " + socket.id);

    // Listen event login
    socket.on("login", (username) => {
        if (users && users.indexOf(username) != -1){
            // Send error message
            console.log("Emit");
            socket.emit("login-fail", "Username already exists!");
        }
        else {
            users.push(username);
            // Only emit login success event to user has been logged.
            socket.emit("login-success", users);
            // Emit new user online to all user, except user has been logged.
            var notification = "User " + username + " has been online.";
            socket.broadcast.emit("a-new-user-online", {notification: notification, users: users});
        }
    }); 


    // Listen event 'send-message'
    socket.on("send-message", (message) => {
        console.log(socket.id + ": " + message);
        // Emit to all user
        // or we can use io.emit
        // io.emit("chat-message", message);
        io.sockets.emit("chat-message", message);

        // Send notification to another user, except user send message
        socket.broadcast.emit("notifications", "You have a new message");
    });

    // Listen event 'send-support-message'
    socket.on("send-support-message", (supportMessage) => {
        console.log(socket.id + ": " + supportMessage);
        $message = "Your message is: " + supportMessage + ". We are processing...";
        // Only emit to user send support message
        socket.emit("reply-support-message", $message);
    });

    // Disconnection
    socket.on("disconnect", () => {
        console.log("A client disconnected with socket id: " + socket.id);
    });
});

app.get("/", (req, res) => {
    res.render("login");
});

// app.get("/support", (req, res) => {
//     res.render("support");
// });

// app.get("/notifications", (req, res) => {
//     res.render("notifications");
// });

// app.listen(3000, () => {
//     console.log("Server running at http://127.0.0.1:3000");
// });