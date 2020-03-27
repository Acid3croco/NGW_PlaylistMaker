const express = require('express')
const database = require('../database/database')
const bcrypt = require('bcrypt')
const input_helper = require('../helpers/input_helper')
const router = express.Router();
const saltRounds = 10

router.get('/', function (request, response) {
    const context = {
        title: 'Signup'
    }
    response.render('signup', context)
})

router.post('/logout', function (request, respose) {
    request.session.destroy((err) => {
        console.log(err)
    })
    respose.redirect('/explore')
})

router.post('/create', async (request, response) => {
    const username = request.body.username
    const password = request.body.password
    const password2 = request.body.password2

    const errors = input_helper.checkErrorSignUp(username, password, password2)

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

router.post('/login', async (request, response) => {
    const username = request.body.username
    const password = request.body.password

    const errors = input_helper.checkErrorLogin(username, password)

    console.log(request.body)

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

module.exports = router;