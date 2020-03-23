const express = require('express')
const database = require('../database/database')
const input_helper = require('../helpers/input_helper')
const router = express.Router()

router.post('/add', async (request, response) => {
    const name = request.body.name
    const playlistid = request.body.playlistid

    const errors = input_helper.checkErrorPlaylistName(name)

    if (errors == 0) {
        var res = database.addSong(name, playlistid)
    }
    response.redirect('/playlists/' + playlistid)
})

router.post('/delete', async (request, response) => {
    const song_id = request.body.song_id
    const playlistid = request.body.playlistid

    database.deleteSong(song_id)
    response.redirect('/playlists/' + playlistid)
})

module.exports = router