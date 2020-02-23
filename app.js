const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const database = require('./src/database/database')
const bcrypt = require('bcrypt')
const port = 8080

const app = express()

const saltRounds = 10

var hbs = exphbs.create({ partialsDir: 'views/partials/', helpers: { "equal": require("handlebars-helper-equal") } })

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
    secret: 'uneso6peutencacheruneautre',
    resave: false,
    saveUninitialized: true
}))

database.initDatabase()

app.get('/', function (request, response) {
    const context = {
        title: 'Landing page',
        session: request.session
    }
    response.render('home', context)
})

app.get('/db/init', (request, response) => {
    console.log('Initalize database')
    database.initDatabase()
    console.log('databse initialized...')
    response.redirect('/')
})

app.get('/db/fill', (request, response) => {
    console.log('Fill database with dummy data...')
    database.insertDatabase()
    console.log('databse filled...')
    response.redirect('/')
})

app.get('/signup', function (request, response) {
    const context = {
        title: 'Signup'
    }
    response.render('signup', context)
})

app.get('/login', function (request, response) {
    const context = {
        title: 'Login'
    }
    response.render('login', context)
})

app.get('/logout', function (request, respose) {
    request.session.destroy((err) => {
        console.log(err)
    })
    respose.redirect('/explore')
})

app.post('/signup/create', async (request, response) => {
    const username = request.body.username
    const password = request.body.password
    const password2 = request.body.password2

    const errors = checkErrorSignUp(username, password, password2)

    if (errors == 0) {
        bcrypt.hash(password, saltRounds, (err, hash) => {
            var res = database.createUser(username, hash)
            res.then((value) => {
                response.redirect('/login')
            }, (reason) => {
                console.log(reason)
                return response.render('signup', { title: 'Signup', errorUsername: true })
            })
        })
    } else {
        return response.render('signup', { title: 'Signup', errorPassword: true })
    }
})

app.post('/login', async (request, response) => {
    const username = request.body.username
    const password = request.body.password

    const errors = checkErrorLogin(username, password)

    if (errors == 0) {
        var res = database.authUser(username)
        res.then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (result == true) {
                        request.session.user_id = user.user_id
                        response.redirect('/explore/' + request.session.user_id)
                    } else {
                        console.log(err)
                        return response.render('login', { title: 'Login', error: true })
                    }
                })
            } else {
                return response.render('login', { title: 'Login', error: true })
            }
        }, (reason) => {
            console.log(reason)
            return response.render('login', { title: 'Login', error: true })
        })
    } else {
        return response.render('login', { title: 'Login', error: true })
    }
})

app.get('/explore/', async (request, response) => {
    const allplaylists = database.getPlaylists()
    const user = database.getUserById(request.params.id)

    Promise.all([allplaylists, user]).then((values) => {
        const context = {
            title: 'Explore',
            session: request.session,
            allplaylists: values[0],
            myplaylists: null,
            user: values[2]
        }
        response.render('explore', context)
    })
})

app.get('/explore/:id', async (request, response) => {
    const allplaylists = database.getPlaylists()
    const myplaylists = database.getPlaylistsByUserId(request.session.id)
    const user = database.getUserById(request.params.id)

    Promise.all([allplaylists, myplaylists, user]).then((values) => {
        const context = {
            title: 'Explore',
            session: request.session,
            allplaylists: values[0].slice(0, 4),
            myplaylists: values[1],
            user: values[2]
        }
        response.render('explore', context)
    })
})

app.get('/users', async (request, response) => {
    const users = database.getUsers()

    users.then((users) => {
        const context = {
            title: 'Users',
            session: request.session,
            users: users
        }
        response.render('users', context)
    })
})

app.get('/my-music/:id', async (request, response) => {
    const playlists = database.getPlaylistsByUserId(request.params.id)
    const user = database.getUserById(request.params.id)
    let title = ''

    Promise.all([playlists, user]).then((values) => {
        if (request.params.id == request.session.user_id) {
            title = 'My music'
        } else {
            title = values[1].username + ' music'
        }
        const context = {
            title: title,
            session: request.session,
            playlists: values[0],
            user: values[1]
        }
        response.render('mymusic', context)
    })
})

app.get('/playlist/:id', async (request, response) => {
    const songs = database.getSongsByPlaylistId(request.params.id)
    const playlist = database.getPlaylistById(request.params.id)
    const user = database.getUserById(playlist.user_id)

    Promise.all([songs, playlist, user]).then(function (values) {
        const context = {
            title: values[1].name,
            session: request.session,
            songs: values[0],
            playlist: values[1],
            user: values[2]
        }
        response.render('playlist', context)
    })
})

app.post('/playlist/add', async (request, response) => {
    const name = request.body.name

    const errors = checkErrorPlaylistName(name)

    if (errors == 0) {
        var res = database.addPlaylist(name, request.session.user_id)
    }
    response.redirect('/my-music/' + request.session.user_id)
})

app.post('/song/add', async (request, response) => {
    const name = request.body.name
    const playlistid = request.body.playlistid

    const errors = checkErrorPlaylistName(name)

    if (errors == 0) {
        var res = database.addSong(name, playlistid)
        console.log(name)
        console.log(playlistid)
    }
    response.redirect('/playlist/' + playlistid)
})

app.get('/about', function (request, response) {
    const context = {
        title: 'About',
        session: request.session
    }
    response.render('about', context)
})

app.get('/contact', function (request, response) {
    const context = {
        title: 'Contact',
        session: request.session
    }
    response.render('contact', context)
})

function checkIsEmpty(string) {
    if (string != null && string != "") {
        return (false)
    }
    return (true)
}

function checkErrorLogin(username, password) {
    if (checkIsEmpty(username) || checkIsEmpty(password)) {
        return (-1)
    }
    return (0)
}

function checkErrorPlaylistName(name) {
    if (checkIsEmpty(name)) {
        return (-1)
    }
    return (0)
}

function checkErrorSignUp(username, password, password2) {
    if (checkIsEmpty(username) || checkIsEmpty(password) || checkIsEmpty(password2)) {
        return (-1)
    } else if (password != password2) {
        return (-1)
    }
    return (0)
}

app.listen(port, () => {
    console.log('Listening on localhost:' + port)
})