var express = require('express');
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/public'));

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    post: 3000,
    password: '',
    database: 'my_db'
});
connection.connect(function (err) {
    if(err){
        console.error('error connectiong: ' + err.stack);
        return;
    }
    console.log('Success DB connection');
});

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var array = new Array();
io.on('connection', function(socket){
    socket.on('login', function(data){
        array.push(data.username);
        socket.username = data.username;
        socket.array = array;
        console.log('client logged-in: ' + data.username);
        console.log('sdas' + array[0]);
        io.emit('login', data.username);
        io.emit('userlist',array);
    });

    socket.on('chat', function(data){
        console.log('Message form %s: %s', socket.username, data.msg);
        var msg = {
            username: socket.username,
            msg: data.msg
        };
        socket.broadcast.emit('chat',msg);
        io.emit('chat',msg);
    });

    socket.on('disconnect', function(data){
        socket.broadcast.emit('logout', socket.username);
        console.log('user disconnected: ' + socket.username);
        array.splice(array.indexOf(socket.username),1);
        //delete array[array.indexOf(data.username)];
        socket.array = array;
        io.emit('disconnect', data.username);
        io.emit('userlist',array);
    });
});


server.listen(3000, function (){
    console.log('Example app listening on port 3000!');
});

app.get('/', function ( req, res) {
    res.render('index.html', {alert: false});
    //res.render('register.html',{alret: false});
});

app.post('/', function(req, res){
    var name = req.body.name;
    var pwd = req.body.pwd;

    // console.log(name, pwd);

    var sql = `SELECT * FROM user_info WHERE username = ?`;
    connection.query(sql, [name], function(error, results, fileds){
        // console.log(results);
        if(results.length == 0){
            res.render('index.html', {alert: true});
        } 
        else{
            var db_pwd = results[0].password;

            if(pwd == db_pwd){
                res.render('welcome.html', {username: name});
                // res.redirect(/welcome);
            } else{
                res.render('index.html', {alert: true});
            }
        }
    });
});

app.get('/register', function ( req, res) {
    res.render('register.html', {alert: false});
});

app.post('/register', function(req, res){
    var name = req.body.name;
    var pwd = req.body.pwd;
    var pwdconf = req.body.pwdconf;
    console.log(name, pwd);
    var sql = 'SELECT * FROM user_info WHERE username = ?';
    connection.query(sql, [name,pwd], function(error, data, fileds){
        if(data.length == 0){
            connection.query("INSERT INTO user_info VALUES(?,?)",[name,pwd],function(){
                console.log(data);
                res.redirect('/');
            })
        }
        else{
            console.log("존재");
            res.render("register.html",{alert: true});
        }
    });
});

app.get('/welcome', function ( req, res) {
    res.render('welcome.html');
});