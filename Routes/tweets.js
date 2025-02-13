var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();

require('../models/connection');
const User = require('../models/user');
const Tweet = require('../models/tweet');


router.post('/newTweet/:token', async (req, res) => {
    try { 
        // Rechercher l'utilisateur via son token
        const tokenData = await User.findOne({ token: req.params.token })
            // sauvegarde du tweet
                if (tokenData) {
                    const date = Date()
                    const newTweet = new Tweet({
                        user: tokenData.id,
                        tweet: req.body.tweet,
                        date: date,
                        trash: false,
                    }); // depploiement de user
                    const saveTweet = await newTweet.save();
                        const populatedTweet = await Tweet.findById(saveTweet.id)
                                .populate('user');
console.log(populatedTweet)
                            const obj = {
                                    firstname : populatedTweet.user.firstname,
                                    username : '@' + populatedTweet.user.username,
                                    avatar : populatedTweet.user.avatar,
                                    token : populatedTweet.user.token,
                                    tweet : populatedTweet.tweet,
                                    date : populatedTweet.date,
                                    trash : populatedTweet.trash
                            }
                            // envois de la réponse
                            res.json({
                                result: true,
                                tweet: obj,
                            });
                        }else {
                            res.json({ result: false, message: 'User not Found.' });
                          }
            } catch (error) {
        // Gérer les erreurs éventuelles
        res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }

})

module.exports = router;