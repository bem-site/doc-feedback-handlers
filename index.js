const fs = require('fs');
const express = require('express');
const app = express().enable('trust proxy');

const MongoClient = require('mongodb').MongoClient;

const config = require('./config');

function find(collection, criteria) {
    return new Promise((resolve, reject) => {
        collection.find(criteria).toArray((err, docs) => {
            if (err) return reject(err);

            resolve(docs);
        });
    });
}

module.exports = function(opts = {}) {
    Object.assign(config, opts);
    const portOrSocket = config.portOrSocket;
    const mongoUrl = config.mongo;
    const urlPrefix = config.pathPrefix;

    const dbConnection = new Promise((resolve, reject) => {
        MongoClient.connect(mongoUrl, function(err, client) {
            if (err) return reject(err);

            console.log('Connected successfully to mongo');

            resolve(client.db('feedbacks'));
        });
    });

    return dbConnection.then(db => {

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
                const data = Object.assign({
                    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                    date: new Date(),
                }, req.query);

                collection.insert(data, (err, result) => {
                    if (err) return res.status(500).send('DB error :(');

                    res.send('ok');
                });
            });
        return app;
    });
};

if (!module.parent) {
    const portOrSocket = config.portOrSocket;

    if (isNaN(portOrSocket)) {
        if (fs.existsSync(portOrSocket)) {
            try {
                fs.unlinkSync(portOrSocket);
            } catch (e) { }
        }
    }
    module.exports()
        .then(app => {
            app.listen(portOrSocket, () => {
                console.log('Server is listening on', portOrSocket);
            });

            isNaN(portOrSocket) && fs.chmod(portOrSocket, '0777');
        })
        .catch(e => {
            console.error('Error ---> ', e.stack || e);
            process.exit(1);
        });
}
