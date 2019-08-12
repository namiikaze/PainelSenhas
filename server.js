var io = require('socket.io').listen(app);

var express = require('express');
var http = require('http');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const mysql = require('mysql');

var ip = require('ip');


const connection = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'painel_senhas'
});

connection.connect(function (err) {
    if (err) return console.log(err);
    console.log('MYSQL Conectado com sucesso!');
    console.log();
});

var senhaMesa = new Array('', '');
var dados = null;
var numeroSenha = 0;
var principal = {};
var senhas1 = {};
var senhas2 = {};
var senhas3 = {};
var senhas4 = {};

zerarSenhas();

for (var i = 0; i < 60; i++)
    console.log(" ");



app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/', function (req, res) {

    //send the index.html file for all requests
    res.sendFile(__dirname + '/index.html');

});

app.use(express.static(__dirname + '/'));

http.listen(3000, function () {

    console.log('Sistema: Painel de Senha ');
    console.log('Painel rodando em http://' + ip.address());


});


io.sockets.emit("senhas", dados);

io.on("connection", function (socket) {
    //console.log('Conexão recebida');

    socket.emit("senhas", dados);

    socket.on("entrar", function (apelido, callback) {
        socket.emit("senhas", dados);
        console.log(apelido);

    });
    senhaMesa.shift();



    socket.on("proximo", function (dados, idUsuario) {
        senhaMesa.push(Array(dados, numeroSenha));
        socket.emit("senhasUsuario", numeroSenha);
        
        console.log('Senha: '+ numeroSenha + ' | Local: '+ dados+ ' | ID Do usuario:' + idUsuario);

        function insertBanco(conn) {

            const sql = "INSERT INTO chamados (local,senha,idUsuario) values('"+dados+"','"+numeroSenha + "', "+idUsuario +" )";


            conn.query(sql, function (error, results, fields) {
                if (error) return console.log(error);
            });
        }
        insertBanco(connection);
        numeroSenha++;
        
    });

    socket.on("setarSenha", function (senha, callback) {
        zerarSenhas();
        numeroSenha = parseInt(senha);

        console.log("AVISO: Senha atual setada para: " + senha);
        io.sockets.emit("senhas", dados);
    })

});



function zerarSenhas() {
    principal = {
        'senha': null,
        'mesa': null
    };
    senhas1 = {
        'senha': null,
        'mesa': null
    };
    senhas2 = {
        'senha': null,
        'mesa': null
    };
    senhas3 = {
        'senha': null,
        'mesa': null
    };
    senhas4 = {
        'senha': null,
        'mesa': null
    };

    dados = {
        'principal': principal,
        'antigas1': senhas1,
        'antigas2': senhas2,
        'antigas3': senhas3,
        'antigas4': senhas4
    };
}



setInterval(func, 1000);
function func() {

    if (senhaMesa.length > 0) {

        senhas4 = senhas3;
        senhas3 = senhas2;
        senhas2 = senhas1;
        senhas1 = principal;

        principal = {
            'senha': senhaMesa[0][1],
            'mesa': senhaMesa[0][0]
        };

        dados = {
            'principal': principal,
            'antigas1': senhas1,
            'antigas2': senhas2,
            'antigas3': senhas3,
            'antigas4': senhas4
        };

        io.sockets.emit("senhas", dados);
        senhaMesa.shift();
    }
}



