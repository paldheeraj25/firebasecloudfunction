const functions = require('firebase-functions');
const firebase = require('firebase');
const express = require('express');
const util = require('util');
const csvparse = require('js-csvparser');
const _ = require('lodash');
const app = express();
const cors = require('cors');

app.use(cors({ origin: "*" }));

firebase.initializeApp({
  serviceAccount: "./firebase1-264402656ff7.json",
  databaseURL: "https://fir-1-a158d.firebaseio.com"
});

//upload function
app.post('/upload', function (req, res) {
  var databaseRef = firebase.database().ref().child('productshoe');
  var encoded = req.body.csv;
  var decoded = Buffer.from(encoded, 'base64').toString();
  decodedCsv = csvparse(decoded);
  var csvHeader = decodedCsv.header[0];

  function generateCsvObject(object) {
    return _.zipObject(csvHeader, object);
  }

  var dataBaseObject = _.chain(decodedCsv.data)
    .map(function (object) {
      return generateCsvObject(object);
    })
    .initial()
    .keyBy('id')
    .value();

  var promise = databaseRef.update(dataBaseObject);
  promise.then(function (data) {
    return res.send({ status: 200 });
  });
  // res.send(util.inspect(dataBaseObject));
});

exports.app = functions.https.onRequest(app);
