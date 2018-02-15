const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;

const config = require('./config');
const port = config.defaultPort;
const mongoUrl = config.mongo;
const urlPrefix = config.pathPrefix;

const dbConnection = new Promise((resolve, reject) => {
    MongoClient.connect(mongoUrl, function(err, client) {
        if (err) return reject(err);

        console.log("Connected successfully to mongo");

        resolve(client.db('feedbacks'));
    });
});

function find(collection, criteria) {
    return new Promise((resolve, reject) => {
        collection.find(criteria).toArray((err, docs) => {
            if (err) return reject(err);

            resolve(docs);
        });
    });
}

dbConnection.then(db => {
    const collection = db.collection('docs');

    app
        .get(`/${urlPrefix}`, (req, res) => {
            const doc = encodeURIComponent(req.query.doc);
            find(collection, { doc }).then(docData => {
                const total = docData.reduce((acc, feedback) => {
                    return acc + +feedback.rating;
                }, 0);

                res.send({
                    total,
                    votes: docData.length
                });
            });
        })
        .post(`/${urlPrefix}`, (req, res) => {
            const query = req.query;

            collection.insert(query, (err, result) => {
                if (err) return res.status(500).send('DB error :(');

                console.log(result);

                res.send('ok');
            });
        });

    app.listen(port, () => {
        console.log('Server is listening on', port);
    });
});

// module.parent || app.listen(port, () => {
//     console.log('Server is listening on', port);
// });

// TODO: fixme, should work async from within bem.info
module.exports = app;
