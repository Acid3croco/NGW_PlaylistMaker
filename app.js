const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const database = require('./src/database/database')
const app = express()
const accounts = require('./src/accounts')
const playlists = require('./src/playlists')
const songs = require('./src/songs')
const api = require('./src/api')

const port = 8640

var hbs = exphbs.create({ partialsDir: 'views/partials/', helpers: { "equal": require("handlebars-helper-equal") } })

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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

app.get('/explore/', async (request, response) => {
    const allplaylists = database.getPlaylistsPublic()
    const user = database.getUserById(request.params.id)

    if (request.session.user_id) {
        response.redirect('/explore/' + request.session.user_id)
    }

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
    const allplaylists = database.getPlaylistsPublic()
    const myplaylists = database.getPlaylistsByUserId(request.session.user_id)
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
    const playlists = database.getPlaylistsPublicByUserId(request.params.id)
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

app.use('/accounts', accounts)
app.use('/playlists', playlists)
app.use('/songs', songs)
app.use('/api', api)

app.listen(port, () => {
    console.log('Listening on localhost:' + port)
})