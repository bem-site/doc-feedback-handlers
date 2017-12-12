const fs = require('fs');
const express = require('express');
const app = express();

const writeFile = require('util').promisify(fs.writeFile);

const port = process.env.port || 3000;

let data = {};
try {
    data = require('./data');
} catch(err) {
    console.log('WARN: no data.json file was found');
}

app
    .get('/', (req, res) => {
        const docUrl = req.query.doc;
        const docData = data[docUrl] || [];

        const total = docData.reduce((acc, feedback) => {
            return acc + +feedback.rating;
        }, 0);

        res.send({
            total,
            votes: docData.length
        });
    })
    .post('/', (req, res) => {
        const query = req.query;
        const docUrl = req.query.doc;

        data[docUrl] || (data[docUrl] = []);
        data[docUrl].push(query);

        file.write('data.json', JSON.stringify(data))
            .then(() => res.send('ok'))
            .catch(err => {
                console.error(err);
                res.status(500).send('Something happend');
            });
    });


app.listen(port, () => {
    console.log('Server is listening on', port);
});
