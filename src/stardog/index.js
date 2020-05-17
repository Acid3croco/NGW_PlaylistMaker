const express = require('express')
const router = express.Router();
const { Connection, query } = require('stardog');

const conn = new Connection({
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
});

router.post('/title', function (request, response) {
    query.execute(conn, 'top50db',
        `PREFIX dc: <http://purl.org/dc/elements/1.1/>

        SELECT ?title WHERE {
            ?music dc:title ?title
        }`,
        'application/sparql-results+json', {
        limit: 50,
        offset: 0,
    }).then(({ body }) => {
        body.results.bindings.forEach(song => {
            console.log(`Title: ${song['title'].value}`)
        });
        response.status(200).json(body.results.bindings)
    }).catch(function (err) {
        console.error(err)
        response.status(400).end()
    });
})

router.post('/maker', function (request, response) {
    query.execute(conn, 'top50db',
        `PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>

        SELECT ?title ?maker WHERE {
            ?music dc:title ?title.
            ?music foaf:maker ?maker
        }`,
        'application/sparql-results+json', {
        limit: 50,
        offset: 0,
    }).then(({ body }) => {
        body.results.bindings.forEach(song => {
            console.log(`Title: ${song['title'].value}, Maker: ${song['maker'].value}`);
        });
        response.status(200).json(body.results.bindings)
    }).catch(function (err) {
        console.error(err)
        response.status(400).end()
    });
})

router.post('/genre', function (request, response) {
    query.execute(conn, 'top50db',
        `PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX mo: <http://purl.org/ontology/mo/>

        SELECT ?title ?genre WHERE {
            ?music dc:title ?title.
            ?music mo:Genre ?genre
        }`,
        'application/sparql-results+json', {
        limit: 50,
        offset: 0,
    }).then(({ body }) => {
        body.results.bindings.forEach(song => {
            console.log(`Title: ${song['title'].value}, Genre: ${song['genre'].value}`);
        });
        response.status(200).json(body.results.bindings)
    }).catch(function (err) {
        console.error(err)
        response.status(400).end()
    });
})

router.post('/rating', function (request, response) {
    query.execute(conn, 'top50db',
        `PREFIX dc: <http://purl.org/dc/elements/1.1/>
        PREFIX ns1: <http://purl.org/stuff/rev#>

        SELECT ?title ?rating WHERE {
            ?music dc:title ?title.
            ?music ns1:ratingRating ?rating
        }`,
        'application/sparql-results+json', {
        limit: 50,
        offset: 0,
    }).then(({ body }) => {
        body.results.bindings.forEach(song => {
            console.log(`Title: ${song['title'].value}, Rating: ${song['rating'].value}`);
        });
        response.status(200).json(body.results.bindings)
    }).catch(function (err) {
        console.error(err)
        response.status(400).end()
    });
})

module.exports = router