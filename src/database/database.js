const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('./public/database/database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)

function initDatabase() {
    db.serialize()
    db.run('CREATE TABLE users(user_id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL)', function (error) {
        if (error) {
            console.log(error)
        } else {
            console.log("users table created")
        }
    })
    db.run('CREATE TABLE playlists(playlist_id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL)', function (error) {
        if (error) {
            console.log(error)
        } else {
            console.log("playlists table created")
        }
    })
    db.run('CREATE TABLE songs(song_id INTEGER PRIMARY KEY, playlist_id INTEGER NOT NULL, name TEXT NOT NULL)', function (error) {
        if (error) {
            console.log(error)
        } else {
            console.log("songs table created")
        }
    })
    insertDatabase()
}

function insertDatabase() {
    var query = "INSERT INTO users(username, password) VALUES ('Alice', 'so6')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO users(username, password) VALUES ('Kevin', 'so6')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO playlists(user_id, name) VALUES (1, 'playlist de Alice')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO playlists(user_id, name) VALUES (2, 'playlist de Kevin')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (1, 'song 1')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (1, 'song 2')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (2, 'song 1')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (2, 'song 2')"
    db.run(query, function (error) {
        if (error) {
            console.log(error)
        }
    })
}

function getUsers() {
    const query = 'SELECT * FROM users'
    return new Promise((resolve, reject) => {
        db.all(query, (err, users) => {
            if (err) {
                return reject(err)
            }
            resolve(users)
        })
    })
}

function getUserById(user_id) {
    const query = 'SELECT * FROM users WHERE user_id = ?'
    return new Promise((resolve, reject) => {
        db.get(query, user_id, (err, users) => {
            if (err) {
                return reject(err)
            }
            resolve(users)
        })
    })
}

function setPlaylistAuthor(playlist) {
    return new Promise((resolve, reject) => {
        const user = getUserById(playlist.user_id)
        user.then((user) => {
            playlist['author'] = user.username
            playlist['author_id'] = user.user_id
            resolve(playlist)
        })
    })
}

function setPlaylistsAuthor(playlists) {
    return new Promise((resolve, reject) => {
        playlists.forEach(async (playlist, a) => {
            setPlaylistAuthor(playlist).then((playlist) => {
                if (a == playlists.length - 1)
                    resolve(playlists)
            })
        })
    })
}

function getPlaylists() {
    const query = 'SELECT * FROM playlists'
    return new Promise((resolve, reject) => {
        db.all(query, (err, playlists) => {
            if (err) {
                return reject(err)
            } else {
                setPlaylistsAuthor(playlists).then((playlists) => {
                    resolve(playlists)
                })
            }
        })
    })
}

function getPlaylistById(playlist_id) {
    const query = 'SELECT * FROM playlists WHERE playlist_id = ?'
    return new Promise((resolve, reject) => {
        db.get(query, playlist_id, (err, playlist) => {
            if (err) {
                return reject(err)
            }
            setPlaylistAuthor(playlist).then((playlist) => {
                resolve(playlist)
            })
        })
    })
}

function getPlaylistsByUserId(user_id) {
    const query = 'SELECT * FROM playlists WHERE user_id = ?'
    return new Promise((resolve, reject) => {
        db.all(query, user_id, (err, playlists) => {
            if (err) {
                return reject(err)
            } else {
                setPlaylistsAuthor(playlists).then((playlists) => {
                    resolve(playlists)
                })
            }
        })
    })
}

function getSongs() {
    const query = 'SELECT * FROM songs'
    return new Promise((resolve, reject) => {
        db.all(query, (err, songs) => {
            if (err) {
                return reject(err)
            }
            resolve(songs)
        })
    })
}

function getSongsByPlaylistId(playlist_id) {
    const query = 'SELECT * FROM songs WHERE playlist_id = ?'
    return new Promise((resolve, reject) => {
        db.all(query, playlist_id, (err, songs) => {
            if (err) {
                return reject(err)
            }
            resolve(songs)
        })
    })
}

function createUser(username, password) {
    const query = "INSERT INTO users(username, password) VALUES (?, ?)"
    return new Promise((resolve, reject) => {
        db.run(query, [username, password], (err) => {
            if (err) {
                reject(err)
            }
            resolve(200)
        })
    })
}

module.exports = { initDatabase, getUsers, getPlaylists, getPlaylistById, getPlaylistsByUserId, getSongs, getSongsByPlaylistId, getUserById, createUser }