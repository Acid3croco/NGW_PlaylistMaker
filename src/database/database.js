const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('./public/database/database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE)

function initDatabase() {
    db.serialize()
    db.run('CREATE TABLE users(user_id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL)', function(error) {
        if (error) {
            //console.log(error)
        } else {
            console.log("users table created")
        }
    })
    db.run('CREATE TABLE playlists(playlist_id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, name TEXT NOT NULL, ispublic BOOLEAN NOT NULL)', function(error) {
        if (error) {
            //console.log(error)
        } else {
            console.log("playlists table created")
        }
    })
    db.run('CREATE TABLE songs(song_id INTEGER PRIMARY KEY, playlist_id INTEGER NOT NULL, name TEXT NOT NULL)', function(error) {
        if (error) {
            //console.log(error)
        } else {
            console.log("songs table created")
        }
    })
}

function insertDatabase() {
    var query = "INSERT INTO users(username, password) VALUES ('Alice', 'so6')"
    db.run(query, function(error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO users(username, password) VALUES ('Kevin', 'so6')"
    db.run(query, function(error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO playlists(user_id, name) VALUES (1, 'playlist de Alice')"
    db.run(query, function(error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO playlists(user_id, name) VALUES (2, 'playlist de Kevin')"
    db.run(query, function(error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (1, 'song 1')"
    db.run(query, function(error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (1, 'song 2')"
    db.run(query, function(error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (2, 'song 1')"
    db.run(query, function(error) {
        if (error) {
            console.log(error)
        }
    })
    query = "INSERT INTO songs(playlist_id, name) VALUES (2, 'song 2')"
    db.run(query, function(error) {
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

function authUser(username) {
    const query = 'SELECT * FROM users WHERE username = ?'
    return new Promise((resolve, reject) => {
        db.get(query, username, (err, user) => {
            if (err) {
                return reject(err)
            }
            resolve(user)
        })
    })
}

function getUserById(user_id) {
    const query = 'SELECT * FROM users WHERE user_id = ?'
    return new Promise((resolve, reject) => {
        db.get(query, user_id, (err, user) => {
            if (err) {
                return reject(err)
            }
            resolve(user)
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
        playlists.forEach(async(playlist, a) => {
            setPlaylistAuthor(playlist).then((playlist) => {
                if (a == playlists.length - 1)
                    resolve(playlists)
            })
        })
    })
}

function getPlaylistsPublic() {
    const query = 'SELECT * FROM playlists WHERE ispublic'
    return new Promise((resolve, reject) => {
        db.all(query, (err, playlists) => {
            if (err) {
                return reject(err)
            }
            if (playlists.length > 0)
                setPlaylistsAuthor(playlists).then((playlists) => {
                    resolve(playlists)
                })
            else {
                resolve(playlists)
            }
        })
    })
}

function getPlaylists() {
    const query = 'SELECT * FROM playlists'
    return new Promise((resolve, reject) => {
        db.all(query, (err, playlists) => {
            if (err) {
                return reject(err)
            }
            if (playlists.length > 0)
                setPlaylistsAuthor(playlists).then((playlists) => {
                    resolve(playlists)
                })
            else {
                resolve(playlists)
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
            }
            if (playlists.length > 0)
                setPlaylistsAuthor(playlists).then((playlists) => {
                    resolve(playlists)
                })
            else {
                resolve(playlists)
            }
        })
    })
}

function getPlaylistsPublicByUserId(user_id) {
    const query = 'SELECT * FROM playlists WHERE user_id = ? AND ispublic'
    return new Promise((resolve, reject) => {
        db.all(query, user_id, (err, playlists) => {
            if (err) {
                return reject(err)
            }
            if (playlists.length > 0)
                setPlaylistsAuthor(playlists).then((playlists) => {
                    resolve(playlists)
                })
            else {
                resolve(playlists)
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

function addPlaylist(user_id, name, ispublic) {
    const query = "INSERT INTO playlists(user_id, name, ispublic) VALUES (?, ?, ?)"
    return new Promise((resolve, reject) => {
        db.run(query, [user_id, name, ispublic], (err) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(200)
        })
    })
}

function changeStatus(playlist_id, ispublic) {
    const query = "UPDATE playlists SET ispublic = ? WHERE playlist_id = ?"
    if (ispublic == true) {
        ispublic = 0
    } else {
        ispublic = 1
    }
    return new Promise((resolve, reject) => {
        db.run(query, [ispublic, playlist_id], (err) => {
            if (err) {
                console.log(err)
                reject(err)
            }
            resolve(200)
        })
    })
}

function addSong(user_id, name, playlist_id) {
    const query = "INSERT INTO songs(playlist_id, name) VALUES (?, ?)"
    const isOwner = checkPlaylistIdUserId(user_id, playlist_id)

    isOwner.then((res) => {
        if (!res)
            return (401)
        return new Promise((resolve, reject) => {
            db.run(query, [playlist_id, name], (err) => {
                if (err) {
                    reject(err)
                }
                resolve(200)
            })
        })
    }).catch((reason) => {
        reject(reason)
    })
}

function deleteSong(song_id) {
    const query = "DELETE FROM songs WHERE song_id = ?"
    return new Promise((resolve, reject) => {
        db.run(query, [song_id], (err) => {
            if (err) {
                reject(err)
            }
            resolve(200)
        })
    })
}

function deleteSongs(paylist_id) {
    const query = "DELETE FROM songs WHERE playlist_id = ?"
    return new Promise((resolve, reject) => {
        db.run(query, [paylist_id], (err) => {
            if (err) {
                reject(err)
            }
            resolve(200)
        })
    })
}

function deletePlaylist(playlist_id) {
    const query = "DELETE FROM playlists WHERE playlist_id = ?"
    const delS = deleteSongs(playlist_id)

    delS.then((res) => {
        if (res == 200) {
            return new Promise((resolve, reject) => {
                db.run(query, [playlist_id], (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(200)
                })
            })
        } else {
            console.log(res)
        }
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

function checkPlaylistIdUserId(user_id, playlist_id) {
    const playlists = getPlaylistsByUserId(user_id)

    return new Promise((resolve, reject) => {
        playlists.then((playlists) => {
            if (playlists.find(playlist => playlist.playlist_id === parseInt(playlist_id))) {
                resolve(true)
            }
            resolve(false)
        }).catch((reason) => {
            console.log(reason)
            reject(false)
        })
    })
}

module.exports = { initDatabase, insertDatabase, getUsers, getPlaylists, getPlaylistById, getPlaylistsByUserId, getSongs, getSongsByPlaylistId, getUserById, createUser, authUser, addSong, addPlaylist, getPlaylistsPublic, getPlaylistsPublicByUserId, deleteSong, changeStatus, deletePlaylist }