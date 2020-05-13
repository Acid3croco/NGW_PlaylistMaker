const express = require('express')
const router = express.Router();

var fetch = require('isomorphic-fetch')
var SimpleClient = require('sparql-http-client/SimpleClient')

const client = new SimpleClient({ endpointUrl: 'http://dbtune.org/musicbrainz/sparql' })

router.post('/song', function (request, response) {
    const song_name = request.body.name

    var query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>

    SELECT DISTINCT ?name WHERE {
        ?track dc:title "${song_name}" .
        ?track foaf:maker ?maker .
        ?maker foaf:name ?name
    }
    LIMIT 50`

    client.query.select(query).then(function (res) {
        return res.json()
    }).then(function (result) {
        var res = result.results.bindings
        console.log(res)
        res.forEach(element => {
            console.log(element['name'].value)
        });
        response.status(200).json(res)
    }).catch(function (err) {
        console.error(err)
        response.status(400).end()
    })
})

router.post('/artist', function (request, response) {
    const artist_name = request.body.artist

    var query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>

    SELECT DISTINCT ?title WHERE {
        ?maker foaf:name "${artist_name}" .
        ?track foaf:maker ?maker .
        ?track dc:title ?title
    }
    LIMIT 1000`

    client.query.select(query).then(function (res) {
        return res.json()
    }).then(function (result) {
        var res = result.results.bindings
        console.log(res)
        res.forEach(element => {
            console.log(element['title'].value)
        });
        response.status(200).json(res)
    }).catch(function (err) {
        console.error(err)
        response.status(400).end()
    })
})

function getTrack(song, artist, debug = false) {

    if (artist === undefined || artist === "")
        artist = "?a"
    else
        artist = `"${artist}"`

    var query = `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    PREFIX mo: <http://purl.org/ontology/mo/>

    SELECT DISTINCT ?len ?alb WHERE {
        ?maker foaf:name ${artist} .
        ?track foaf:maker ?maker .
        ?track dc:title "${song}" .
        ?track mo:length ?len .
        ?album mo:track ?track .
        ?album dc:title ?alb
    }
    LIMIT 1`

    if (debug) console.log(query)
    return client.query.select(query).then(function (res) {
        return res.json()
    }).then(function (result) {
        return (result.results.bindings)
    }).catch(function (err) {
        return (err)
    })
}

router.post('/track', function (request, response) {
    const song_name = request.body.song
    const artist_name = request.body.artist
    const debug = request.body.debug || false

    getTrack(song_name, artist_name, debug).then(function (result) {
        result.forEach(element => {
            console.log(element['len'].value)
            console.log(element['alb'].value)
        });
        response.status(200).json(result)
    }).catch(function (err) {
        console.error(err)
        response.status(400).end()
    })
})

router.get('/test', function (request, response) {
    var query = `
    PREFIX mo: <http://purl.org/ontology/mo/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>

    SELECT DISTINCT ?name WHERE {
        ?track dc:title "Curtains Up" .
        ?track foaf:maker ?maker .
        ?maker foaf:name ?name
    }
    LIMIT 40`

    client.query.select(query).then(function (res) {
        return res.json()
    }).then(function (result) {
        var res = result.results.bindings
        console.log(res)
        res.forEach(element => {
            console.log(element['name'].value)
        });
    }).catch(function (err) {
        console.error(err)
    })
})

module.exports = { router: router, getTrack: getTrack }