const mongoose = require('mongoose');

const hastagSchema = mongoose.Schema({
    name: String ,
    tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets' }] 
});

const Hastag = mongoose.model('hatags', hastagSchema);

module.exports = Hastag;