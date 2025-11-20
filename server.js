const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let datos = { temp: 0, hum: 0 };
let led = "off";

// Arduino envía datos
app.post("/data", (req, res) => {
  datos = req.body;
  console.log("Datos:", datos);
  res.json({ ok: true });
});

// Web consulta datos
app.get("/data", (req, res) => {
  res.json({ datos, led });
});

// Web cambia estado del LED
app.post("/led", (req, res) => {
  led = req.body.state;
  console.log("LED:", led);
  res.json({ ok: true, led });
});

// Arduino consulta LED
app.get("/led", (req, res) => {
  res.json({ led });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Servidor en puerto", port));
