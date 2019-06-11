$(function(){
    var socket = io();

    socket.emit("login", {username: username});


    socket.on("login", function (data){
        $("#chatLog").append("<li><strong>" + data + "</strong> has entered</li>");
        document.getElementById('in').play();
        $("#chatLog").scrollTop($("#chatLog").height()+10000000);
    });
    socket.on("logout", function (data){
        $("#chatLog").append("<li><strong>" + data + "</strong> has exited</li>");
        document.getElementById('out').play();
        $("#chatLog").scrollTop($("#chatLog").height()+10000000);
    });
    socket.on("userlist",function(data){
        $("#connect").empty();
        for(var i=0; i<data.length; i++){
            $("#connect").append("<strong>" + data[i]+ "<br>");
        }
    });

    socket.on("chat", function (data){
        var date = new Date();
        $("#chatLog").append("<li><strong>" + data.username + "</strong>: " + data.msg + " ("+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+")</li>");
        $("#chatLog").scrollTop($("#chatLog").height()+10000000);
    });
    $("#myForm").submit(function(e){
        e.preventDefault();
        var $msgForm = $("#msgForm");

        socket.emit("chat", {msg: $msgForm.val() });
        document.getElementById('msgForm').value = ''
    });
});