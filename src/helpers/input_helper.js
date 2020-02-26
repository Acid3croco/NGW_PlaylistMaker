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

module.exports = { checkErrorLogin, checkErrorPlaylistName, checkErrorSignUp }