const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstname: String,
    username: String,
    password: String,
    tokenUser: String,
    avatar: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;