'use strict';
const express = require('express');
const PORT = process.env.PORT || 8080;

const app = express();

app.get('/', (req, res) => {
  res.send("Welcome from node.js");
});


app.get('/*', (req, res) => {
  res.status(404).send(`${req.path} not found`);
});


app.listen(PORT, () => {
  console.log(`simple webserver up and running, listen on port ${PORT}`);
});
