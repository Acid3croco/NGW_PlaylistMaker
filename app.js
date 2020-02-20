const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const database = require('./src/database/database')

const app = express()

app.engine('handlebars', exphbs({ partialsDir: 'views/partials/' }))
app.set('view engine', 'handlebars')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
    'secret': 'uneso6peutencacheruneautre'
}))

database.initDatabase()

app.get('/', function (request, response) {
    const context = {
        title: 'Landing page',
    }
    response.render('home', context)
})

app.get('/login', function (request, response) {
    const context = {
        title: 'Login',
    }
    response.render('login', context)
})

app.get('/signup', function (request, response) {
    const context = {
        title: 'Signup',
    }
    response.render('signup', context)
})

app.post('/signup/create', async (request, response) => {
    const username = request.body.username
    const password = request.body.password

    const errors = 0

    if (errors == 0) {
        var res = database.createUser(username, password)
        res.then((value) => {
            console.log(value)
        }, (reason) => {
            console.log(reason)
        })
    }
})

app.get('/explore/:id', async (request, response) => {
    const allplaylists = database.getPlaylists()
    const myplaylists = database.getPlaylistsByUserId(request.params.id)
    const user = database.getUserById(request.params.id)

    Promise.all([allplaylists, myplaylists, user]).then((values) => {
        const context = {
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
            users: users
        }
        response.render('users', context)
    })
})

app.get('/my-music/:id', async (request, response) => {
    const playlists = database.getPlaylistsByUserId(request.params.id)
    const user = database.getUserById(request.params.id)

    Promise.all([playlists, user]).then((values) => {
        const context = {
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
            songs: values[0],
            playlist: values[1],
            user: values[2]
        }
        response.render('playlist', context)
    })
})

app.get('/about', function (request, response) {
    response.render('about')
})

app.get('/contact', function (request, response) {
    response.render('contact')
})

app.listen(8080)