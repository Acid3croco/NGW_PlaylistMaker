const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const database = require('./src/database/database')
const accounts = require('./src/accounts')
const playlists = require('./src/playlists')
const songs = require('./src/songs')
const api = require('./src/api')
const stardog = require('./src/stardog')
const sparql = require('./src/sparql').router

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

app.use('/accounts', accounts)
app.use('/playlists', playlists)
app.use('/songs', songs)
app.use('/api', api)
app.use('/stardog', stardog)
app.use('/sparql', sparql)

app.get('/', function (request, response) {
    const context = {
        title: 'Home',
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

    if (request.session.user_id) {
        response.redirect('/explore/' + request.session.user_id)
    }

    allplaylists.then((allplaylists) => {
        const context = {
            title: 'Explore',
            session: request.session,
            allplaylists: allplaylists,
            myplaylists: null,
            user: null
        }
        response.render('explore', context)
    }).catch((err) => {
        response.render('error', { title: "Error" })
    })
})

app.get('/explore/:id', async (request, response) => {
    const allplaylists = database.getPlaylistsPublic()
    const myplaylists = database.getPlaylistsByUserId(request.session.user_id)
    const user = database.getUserById(request.params.id)

    Promise.all([allplaylists, myplaylists, user]).then(([allplaylists, myplaylists, user]) => {
        const context = {
            title: 'Explore',
            session: request.session,
            allplaylists: allplaylists.slice(0, 4),
            myplaylists: myplaylists,
            user: user
        }
        response.render('explore', context)
    }).catch((err) => {
        response.render('error', { title: "Error" })
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
    }).catch((err) => {
        response.render('error', { title: "Error" })
    })
})

app.get('/my-music/:id', async (request, response) => {
    const user = database.getUserById(request.params.id)
    let title = ''
    let playlists = null

    if (request.params.id == request.session.user_id)
        playlists = database.getPlaylistsByUserId(request.params.id)
    else
        playlists = database.getPlaylistsPublicByUserId(request.params.id)

    Promise.all([playlists, user]).then(([playlists, user]) => {
        if (request.params.id == request.session.user_id) {
            title = 'My music'
        } else {
            title = user.username + ' music'
        }
        const context = {
            title: title,
            session: request.session,
            playlists: playlists,
            user: user

        }
        response.render('mymusic', context)
    }).catch((err) => {
        console.log(err)
        response.render('error', { title: "Error" })
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

app.get('*', function (request, response) {
    const context = {
        title: 'Error',
        message: 'Seems like you are lost in the dark',
        button: 'Bring me to the light!'
    }
    response.render('error', context)
});

app.listen(port, () => {
    console.log('Listening on localhost:' + port)
})

module.exports = app