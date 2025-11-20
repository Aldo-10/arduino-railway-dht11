# arduino-railway-dht11
Sistema IoT con Arduino R4 WiFi y DHT11 que envía temperatura y humedad a un servidor en Railway, con control remoto del LED 13 desde una página web.

📘 README.md
Arduino R4 WiFi + Railway + DHT11 (IoT Completo)

Este proyecto implementa un sistema IoT donde un Arduino R4 WiFi mide la temperatura y humedad usando un sensor DHT11, y envía los datos a un servidor Node.js alojado en Railway.
Además, desde una página web puedes visualizar los datos en tiempo real y encender/apagar el LED 13 del Arduino a través de Internet.

🧱 Arquitectura del proyecto
Arduino R4 WiFi + DHT11
          ↓ (HTTP POST / GET)
Servidor en Railway (Node.js + Express)
          ↓
Página Web (incluida en /public)
          ↓
Google Sites (embed)

🚀 Características

✔ Lectura de temperatura y humedad (DHT11)
✔ Envío de datos por HTTP POST a Railway
✔ API REST para obtener datos en tiempo real
✔ Control remoto del LED 13 del Arduino
✔ Interfaz web incluida (HTML/JS)
✔ Compatible con Google Sites mediante iframe
✔ Backend liviano con Express

📁 Estructura del proyecto
/ (root)
│── server.js
│── package.json
│── Procfile
│── /public
│      └── index.html
└── README.md

🟩 1. Servidor Railway – Node.js

Este servidor:

recibe los datos del Arduino

almacena temperatura y humedad

permite a la web ver los datos

permite enviar el comando led:on/off

server.js
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let datos = { temp: 0, hum: 0 };
let led = "off";

app.post("/data", (req, res) => {
  datos = req.body;
  console.log("Datos:", datos);
  res.json({ ok: true });
});

app.get("/data", (req, res) => {
  res.json({ datos, led });
});

app.post("/led", (req, res) => {
  led = req.body.state;
  console.log("LED:", led);
  res.json({ ok: true, led });
});

app.get("/led", (req, res) => {
  res.json({ led });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Servidor en puerto", port));

🟦 2. Página Web (Interfaz)

Ubicada en /public/index.html.
Permite ver temperatura/humedad y controlar el LED 13.

<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Datos Arduino</title>
</head>
<body>
  <h2>Temperatura y Humedad en Tiempo Real</h2>

  <p>Temperatura: <span id="temp">--</span> °C</p>
  <p>Humedad: <span id="hum">--</span> %</p>

  <h3>Control del LED 13</h3>
  <button onclick="led('on')">Encender LED</button>
  <button onclick="led('off')">Apagar LED</button>

<script>
function actualizar() {
  fetch("/data")
    .then(r => r.json())
    .then(d => {
      document.getElementById("temp").innerText = d.datos.temp;
      document.getElementById("hum").innerText = d.datos.hum;
    });
}

function led(state) {
  fetch("/led", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state })
  });
}

setInterval(actualizar, 2000);
</script>

</body>
</html>

🟧 3. Arduino R4 WiFi (DHT11)

Este es el sketch UNIFICADO.
Solo este se sube al Arduino.

#include <WiFiS3.h>
#include <HTTPClient.h>
#include "DHT.h"

#define DHTPIN 2
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

char ssid[] = "TU_WIFI";
char pass[] = "TU_PASSWORD";

const char* postURL = "https://TU-SERVIDOR-RAILWAY.up.railway.app/data";
const char* ledURL  = "https://TU-SERVIDOR-RAILWAY.up.railway.app/led";

const int LED_PIN = 13;

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(LED_PIN, OUTPUT);

  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi conectado");
}

void loop() {

  float temperatura = dht.readTemperature();
  float humedad = dht.readHumidity();

  if (isnan(temperatura) || isnan(humedad)) {
    Serial.println("Error leyendo DHT11");
    delay(2000);
    return;
  }

  if (WiFi.status() == WL_CONNECTED) {

    // Enviar datos al servidor
    HTTPClient http1;
    http1.begin(postURL);
    http1.addHeader("Content-Type", "application/json");

    String body = "{\"temp\":" + String(temperatura) +
                  ",\"hum\":" + String(humedad) + "}";

    http1.POST(body);
    http1.end();

    // Consultar estado del LED
    HTTPClient http2;
    http2.begin(ledURL);

    int code = http2.GET();
    if (code == 200) {
      String payload = http2.getString();
      if (payload.indexOf("on") > -1) digitalWrite(LED_PIN, HIGH);
      else digitalWrite(LED_PIN, LOW);
    }
    http2.end();
  }

  delay(3000);
}

🚀 4. Cómo desplegar en Railway

Crea un nuevo proyecto → Deploy from GitHub

Selecciona este repositorio

Railway detectará Node.js automáticamente

Espera el deploy

Obtendrás una URL similar a:

https://arduino-railway-production.up.railway.app


Ponla en:

el Arduino (postURL, ledURL)

Google Sites (iframe con el index)

🟣 5. Cómo incrustar en Google Sites

En Google Sites:

➡ Insertar → Incorporar (Embed) → Por URL
➡ Pega la URL del servidor de Railway
➡ Guarda

La web mostrará:

✔ Temperatura
✔ Humedad
✔ Botones para LED

🙌 6. Contribuir / Mejorar

Puedes ampliar este proyecto:

agregar base de datos (MongoDB, SQLite, PostgreSQL)

agregar historial de temperatura/humedad

agregar gráficos en tiempo real (Chart.js)

agregar autenticación (token API)

📜 Licencia

MIT — Libre para modificar y usar.
