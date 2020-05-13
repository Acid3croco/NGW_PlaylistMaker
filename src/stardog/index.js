const express = require('express')
const router = express.Router();
const { Connection, query } = require('stardog');

const conn = new Connection({
    username: 'admin',
    password: 'admin',
    endpoint: 'http://localhost:5820',
});

router.get('/title', function (request, response) {
    query.execute(conn, 'top50db',
        `PREFIX dc: <http://purl.org/dc/elements/1.1/>

        SELECT ?title WHERE {
            ?music dc:title ?title
        }`,
        'application/sparql-results+json', {
        limit: 50,
        offset: 0,
    }).then(({ body }) => {
        console.log(body.results.bindings + '\n');
    });
})

router.get('/maker', function (request, response) {
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
        console.log(body.results.bindings);
    });
})

router.get('/genre', function (request, response) {
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
        console.log(body.results.bindings);
    });
})

router.get('/rating', function (request, response) {
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
        console.log(body.results.bindings);
    });
})

module.exports = router