const express = require('express')
const bcrypt = require('bcrypt')
const database = require('../database/database')
const input_helper = require('../helpers/input_helper')
const jwt = require('jsonwebtoken')
const router = express.Router()

const accessTokenSecret = "cjewvbejcurwhuivhuirewnvuininiktarasfdkl"

const authenticateJWT = (request, response, next) => {
    const authHeader = request.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return response.sendStatus(403);
            }

            request.user = user;
            next();
        });
    } else {
        response.sendStatus(401);
    }
};

router.get('/users', function (request, response) {
    const users = database.getUsers()

    users.then((values) => {
        if (values)
            response.status(200).json(values)
        else
            response.status(404).end()
    })
})

router.get('/playlists', function (request, response) {
    const playlists = database.getPlaylists()

    playlists.then((values) => {
        if (values)
            response.status(200).json(values)
        else
            response.status(404).end()
    })
})

router.post('/playlists', authenticateJWT, function (request, response) {
    const name = request.body.name
    let ispublic = request.body.ispublic

    const errors = input_helper.checkErrorPlaylistName(name)
    if (errors)
        response.status(400).end()
    if (ispublic == "on")
        ispublic = true
    else
        ispublic = false

    if (errors == 0) {
        var res = database.addPlaylist(request.user.user_id, name, ispublic)
        res.then((status) => {
            response.status(200).end()
        }, (reason) => {
            console.log(reason)
            response.status(400).end()
        })
    }
})

router.post('/songs', authenticateJWT, function (request, response) {
    const name = request.body.name
    const playlistid = request.body.playlistid

    const errors = input_helper.checkErrorPlaylistName(name)

    if (errors == 0) {
        var res = database.addSong(name, playlistid)
        res.then((status) => {
            response.status(200).end()
        }, (reason) => {
            console.log(reason)
            response.status(400).end()
        })
    }
})

router.post('/tokens', async (request, response) => {
    const username = request.body.username
    const password = request.body.password

    const errors = input_helper.checkErrorLogin(username, password)

    if (errors == 0) {
        var res = database.authUser(username)
        res.then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result == true) {
                        const accessToken = jwt.sign({
                            user_id: user.user_id
                        }, accessTokenSecret)

                        const idToken = jwt.sign({
                            user_id: user.user_id,
                            username: user.username,
                        }, accessTokenSecret)

                        response.status(200).json({
                            accessToken: accessToken,
                            idToken: idToken
                        })
                    } else {
                        console.log(err)
                        response.status(400).end()
                    }
                })
            } else {
                response.status(400).end()
            }
        }, (reason) => {
            console.log(reason)
            response.status(400).end()
        })
    } else {
        response.status(400).end()
    }
})

module.exports = router