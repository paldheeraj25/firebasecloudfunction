const functions = require('firebase-functions');
const firebase = require('firebase');
const admin = require("firebase-admin");
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

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "fir-1-a158d",
    clientEmail: "pdheeraj368@gmail.com",
    privateKey: "AIzaSyAmRyEnBCXIGnfE9lZaGkVXYv2hqHHrYEg"
  }),
  databaseURL: "https://fir-1-a158d.firebaseio.com"
});
//upload function
app.post('/upload', function (req, res) {
  var idToken = req.body.key;
  var uid;
  //authenticating user
  admin.auth().verifyIdToken(idToken)
    .then(function (decodedToken) {
      uid = decodedToken.uid;
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
      },
        function (data) {
          return res.send(data);
        });
    }).catch(function (error) {
      // Handle error
      res.send(error);
    });


  //res.send(util.inspect(dataBaseObject));
});

exports.app = functions.https.onRequest(app);
