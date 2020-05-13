const express = require('express')
const database = require('../database/database')
const input_helper = require('../helpers/input_helper')
const getTrack = require('../sparql').getTrack
const msToMin = require('../helpers/time_helper').msToMin
const router = express.Router()

router.get('/:id', async (request, response) => {
    const songs = database.getSongsByPlaylistId(request.params.id)
    const playlist = database.getPlaylistById(request.params.id)
    const user = database.getUserById(request.session.user_id)

    const newSongs = []

    Promise.all([songs, playlist, user]).then(function (values) {
        values[0].forEach(song => {
            getTrack(song.name, song.artist).then((res) => {
                var album = undefined
                var duration = undefined
                if (res.length > 0) {
                    album = res[0]['alb'].value
                    duration = msToMin(res[0]['len'].value)
                }
                newSongs.push({ "song_id": song.song_id, "name": song.name, "artist": song.artist, "album": album, "duration": duration })
                if (newSongs.length == values[0].length) {
                    const context = {
                        title: values[1].name,
                        session: request.session,
                        songs: newSongs.sort((a, b) => a.name > b.name),
                        playlist: values[1],
                        user: values[2]
                    }
                    response.render('playlist', context)
                }
            })
        });

    })
})

router.post('/add', async (request, response) => {
    const name = request.body.name
    let ispublic = request.body.ispublic

    const errors = input_helper.checkErrorPlaylistName(name)
    if (ispublic == "on")
        ispublic = true
    else
        ispublic = false

    if (errors == 0) {
        var res = database.addPlaylist(request.session.user_id, name, ispublic)
    }
    response.redirect('/my-music/' + request.session.user_id)
})

router.post('/changeStatus', async (request, response) => {
    const playlist_id = request.body.playlist_id
    const ispublic = request.body.ispublic

    database.changeStatus(playlist_id, ispublic)
    response.redirect('/playlists/' + playlist_id)
})

router.post('/delete', async (request, response) => {
    const playlist_id = request.body.playlist_id

    database.deletePlaylist(playlist_id)
    response.redirect('/my-music/' + request.session.user_id)
})

module.exports = router