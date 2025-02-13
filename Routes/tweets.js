var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
const uid2 = require('uid2');

require('../models/connection');
const User = require('../models/user');
const Tweet = require('../models/tweet');

//--------------------------------------------------------------------------
// NewTweet Road
//--------------------------------------------------------------------------

router.post('/newTweet/:tokenUser', async (req, res) => {
    try {
        // Rechercher l'utilisateur via son token
        const tokenData = await User.findOne({ tokenUser: req.params.tokenUser })
        console.log(tokenData)
        // sauvegarde du tweet
        if (tokenData) {
            const date = Date()
            const newTweet = new Tweet({
                user: tokenData.id,
                tweet: req.body.tweet,
                date: date,
                tokenTweet: uid2(32),
                trash: false,
            }); // depploiement de user
            const saveTweet = await newTweet.save();
            const populatedTweet = await Tweet.findById(saveTweet.id)
                .populate('user');
            console.log(populatedTweet)
            const obj = {
                firstname: populatedTweet.user.firstname,
                username: '@' + populatedTweet.user.username,
                avatar: populatedTweet.user.avatar,
                tokenUser: populatedTweet.user.tokenUser,
                tweet: populatedTweet.tweet,
                date: populatedTweet.date,
                trash: populatedTweet.trash,
                tokenTweet: populatedTweet.tokenTweet,
                like: populatedTweet.like,
            }
            // envois de la réponse
            res.json({
                result: true,
                tweet: obj,
            });
        } else {
            res.json({ result: false, message: 'User not Found.' });
        }
    } catch (error) {
        // Gérer les erreurs éventuelles
        res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }
})

//--------------------------------------------------------------------------
// Get allTweet Road
//--------------------------------------------------------------------------
router.get('/', async (req, res) => {
    try {
        const tweetData = await Tweet.find({ trash: false }).populate('user')
        const obj = tweetData.map(tweet => ({
            firstname: tweet.user.firstname,
            username: '@' + tweet.user.username,
            avatar: tweet.user.avatar,
            tokenUser: tweet.user.tokenUser,
            tweet: tweet.tweet,
            date: tweet.date,
            trash: tweet.trash,
            tokenTweet: tweet.tokenTweet,
            like: tweet.like,
        }))
        //  console.log(tweetData)
        res.json({ result: true, tweets: obj })
    } catch (error) {
        // errors 
        res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }
})

//--------------------------------------------------------------------------
// Ubdapte liketweet/unLikeTweet Road
//--------------------------------------------------------------------------

router.put('/likeTweet/:tokenTweet/:tokenUser', async (req, res) => {
    try {
        //  look for user
        const userlike = await User.findOne({ tokenUser: req.params.tokenUser });
        if (!userlike) {
            return res.status(404).json({ result: false, message: 'user not found.' });
        }

        // look for the tweet
        const tweetLike = await Tweet.findOne({ tokenTweet: req.params.tokenTweet });
        if (!tweetLike) {
            return res.status(404).json({ result: false, message: 'Tweet not found.' });
        }

        console.log('C\'est le user qui like:', userlike.username);

        // remove one like and the user's liker if it's already like by user
        if (tweetLike.liker.includes(userlike.username)) {
            await Tweet.updateOne({ tokenTweet: req.params.tokenTweet }, { $inc: { like: -1 } });
            tweetLike.liker = tweetLike.liker.filter(username => username !== userlike.username);

        // add on like and one user liker
        } else {
            await Tweet.updateOne({ tokenTweet: req.params.tokenTweet }, { $inc: { like: 1 } });
            tweetLike.liker.push(userlike.username);
        }

        await tweetLike.save();

        console.log('Liste des likers mise à jour:', tweetLike.liker);

        return res.json({ result: true, message: 'Action effectuée avec succès.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }
});


module.exports = router;