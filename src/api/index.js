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

router.post('/playlists', authenticateJWT, function (request, response) {
    const accountId = request.body.accountId
    const name = request.body.name
    const isPublic = request.body.isPublic
    const errors = input_helper.checkErrorPlaylistName(name)

    if (errors == -1)
        response.status(400).end()

    if (errors == 0) {
        if (request.user.user_id === accountId) {
            var res = database.addPlaylist(accountId, name, isPublic)
            res.then((status) => {
                response.status(200).end()
            }, (reason) => {
                console.log(reason)
                response.status(401).end()
            })
        } else {
            response.status(401).end()
        }
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
                        const access_token = jwt.sign({
                            user_id: user.user_id
                        }, accessTokenSecret)

                        const id_token = jwt.sign({
                            sub: user.user_id,
                            preferred_username: user.username,
                        }, accessTokenSecret)

                        response.status(200).json({
                            access_token: access_token,
                            token_type: "Bearer",
                            id_token: id_token
                        })
                    } else {
                        console.log(err)
                        response.status(400).json({ "error": "invalid_grant" })
                    }
                })
            } else {
                response.status(400).json({ "error": "invalid_grant" })
            }
        }, (reason) => {
            console.log(reason)
            response.status(400).json({ "error": "invalid_grant" })
        })
    } else {
        response.status(400).json({ "error": "invalid_grant" })
    }
})

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

module.exports = router