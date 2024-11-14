let days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

var value = 0;
var second = 0;
var minute = 0;
var hour = 0;

var opened = false;
var socket = null;

function abrirSocket() {
    socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
        opened = true;
        const d = new Date();
        const msg = 't ' + d.getHours().toString().padStart(2, "0") +
            d.getMinutes().toString().padStart(2, "0") + d.getSeconds().toString().padStart(2, "0");

    };

    socket.onmessage = event => {
        console.log(`Message from server: ${event.data}`);
    };

    socket.onclose = function (e) {
        socket = null;
    }

    socket.onerror = function (err) {
        console.error(err)
        socket.close();
    };
}

abrirSocket();

function actualizarWeb() {
    const d = new Date();
    hour = d.getHours();
    minute = d.getMinutes();
    second = d.getSeconds();
    document.getElementById("hour").innerHTML = hour.toString().padStart(2, "0");
    document.getElementById("minute").innerHTML = minute.toString().padStart(2, "0");
    document.getElementById("second").innerHTML = second.toString().padStart(2, "0");
    document.getElementById("dayWeek").innerHTML = days[parseInt(d.getDay())] + ",";
    document.getElementById("day").innerHTML = d.getDate().toString().padStart(2, "0");
    document.getElementById("month").innerHTML = months[parseInt(d.getMonth())];
    document.getElementById("year").innerHTML = d.getFullYear();
}

function actualizar() {
    second += 1;
    if (second >= 60) {
        minute += 1;
        second = 0;
        if (minute >= 60) {
            hour += 1;
            minute = 0;
        }
    }
    document.getElementById("hour").innerHTML = hour.toString().padStart(2, "0");
    document.getElementById("minute").innerHTML = minute.toString().padStart(2, "0");
    document.getElementById("second").innerHTML = second.toString().padStart(2, "0");
}

function actualizarHora() {
    if (opened) {
        const msg = 't ' + hour.toString().padStart(2, "0") + minute.toString().padStart(2, "0")
            + second.toString().padStart(2, "0");
        if (socket == null) {
            abrir(msg);
        } else {
            socket.send(msg);
        }
    }
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const repeatedGreetings = async () => {
    while (true) {
        actualizarWeb();
        await sleep(1000)
        actualizar();
        value += 1;
        if (value > 3660) {
            actualizarWeb();
            actualizarHora();
        }
    }
}

const abrir = async (message) => {
    while (socket == null) {
        abrirSocket();
        await sleep(1000);
    }
    socket.send(message);
}

window.addEventListener('load', function () {
    repeatedGreetings();
    document.getElementById("encender").onclick = function () {
        if (socket == null) {
            abrir('c e');
        } else {
            socket.send('c e');
        }
    };
    document.getElementById("apagar").onclick = function () {
        if (socket == null) {
            abrir('c a');
        } else {
            socket.send('c a');
        }
    };
    document.getElementById("getHour").onclick = function () {
        if (socket == null) {
            abrir('h i');
        } else {
            socket.send('h i');
        }
    };
});

