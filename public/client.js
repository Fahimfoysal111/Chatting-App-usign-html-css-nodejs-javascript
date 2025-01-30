let userName;
let roomName;

const input = $("input[name='txt-msg']");
const messageBody = $(".message-body");
const classUser = $(".user");
const socket = io();

socket.on('connect', addUser);
socket.on('updateusers', updateUserList);

function addUser() {
    userName = prompt("Enter your Name!");
    roomName = prompt("Enter your room name!");
    socket.emit('adduser', userName, roomName);
}

input.on('keyup', function (e) {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

function sendMessage(message) {
    let msg = {
        user: userName,
        message: message.trim()
    };
    appendMessage(msg, 'outgoing');
    input.val('');
    goDown();
    socket.emit('message', msg);
}

function appendMessage(msg, type) {
    let newDiv = $('<div>').addClass(type + ' message');
    newDiv.html(`<h4>${msg.user}</h4><p>${msg.message}</p>`);
    messageBody.append(newDiv);
}

function goDown() {
    messageBody.scrollTop(messageBody[0].scrollHeight);
}

function sendClick() {
    var message = input.val();
    sendMessage(message);
}

socket.on('message', (msg) => {
    appendMessage(msg, 'incoming');
    goDown();
});

socket.on('greeting', (data) => {
    let msg = {
        user: "Server",
        message: "Welcome " + data + "! You have been connected."
    };
    appendMessage(msg, 'incoming');
    goDown();
});

function updateUserList(data) {
    classUser.empty();
    $('.room').html(roomName);
    $.each(data, function (key, value) {
        if (key.endsWith(roomName)) {
            let newSpan = $('<span>').html(`<img src="user.png" alt="${value}"><sub class="on_off">${value}</sub>`);
            classUser.append(newSpan);
        }
    });
}

$('#imageInput').on('change', function (e) {
    var reader = new FileReader();
    var file = e.target.files[0];

    reader.onload = evt => {
        if (file.type.startsWith('image/')) {
            socket.emit('uploadImage', evt.target.result, userName);
            appendImage(evt.target.result, 'outgoing');
        } else {
            socket.emit('uploadFile', evt.target.result, userName, file.name);
            appendFile(file.name, evt.target.result, 'outgoing');
        }
    };

    reader.readAsDataURL(file);
    $('#imageInput').val(''); // Clear input field
});

function appendImage(data, type) {
    messageBody.append(`<div class="message ${type}"><h4>${userName}</h4><img src="${data}" class="uploadedImage"/></div>`);
    goDown();
}

function appendFile(fileName, data, type) {
    messageBody.append(`<div class="message ${type}"><h4>${userName}</h4><a href="${data}" download="${fileName}">${fileName}</a></div>`);
    goDown();
}

socket.on('publishImage', (data, user) => appendImage(data, 'incoming'));
socket.on('publishFile', (data, user, fileName) => appendFile(fileName, data, 'incoming'));
