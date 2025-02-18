var express = require('express');
var router = express.Router();
var express = require('express');
var router = express.Router();
const uid2 = require('uid2');
const { getTimeElapsed } = require('../modules/momentfromnow');
const { findhastag } = require('../modules/findhastag')
const moment = require('moment');
require('../models/connection');
const User = require('../models/user');
const Tweet = require('../models/tweet');
const Hashtag= require('../models/hastag')

//--------------------------------------------------------------------------
// NewTweet Road
//--------------------------------------------------------------------------

router.post('/newTweet/:tokenUser', async (req, res) => {
    try {
        
        // Look for user by his token
        const tokenData = await User.findOne({ tokenUser: req.params.tokenUser })
        // console.log("user found" +tokenData)
        
        // Impossible to send empty tweet
        if (!req.body.tweet || req.body.tweet.trim() === '') {
            return res.status(400).json({ result: false, message: 'Le tweet ne peut pas être vide.' });
        }

        // save the new tweet
        if (tokenData) {
            const date = new Date()
            const newTweet = new Tweet({
                user: tokenData.id,
                tweet: req.body.tweet,
                date: date,
                tokenTweet: uid2(32),
                trash: false,
            }); 
            const saveTweet = await newTweet.save();
            // console.log("tweet saved" + saveTweet)

            const hashtags = findhastag(newTweet.tweet);
            // console.log("# détecté" + hashtags)
            for (const hashtag of hashtags) {
                let hashtagDoc = await Hashtag.findOne({ name: hashtag });
    
                if (!hashtagDoc) {
                    hashtagDoc = new Hashtag({ name: hashtag, tweets: [] });
                }
    
                if (!hashtagDoc.tweets.includes(newTweet._id)) {
                    hashtagDoc.tweets.push(newTweet._id);
                    await hashtagDoc.save();
                }
            }
    



            //------------show the new tweet------------
            
            // const populatedTweet = await Tweet.findById(saveTweet.id)
            //     .populate('user');

                
            //tweet formated
            // const obj = {
            //     firstname: populatedTweet.user.firstname,
            //     username: '@' + populatedTweet.user.username,
            //     avatar: populatedTweet.user.avatar,
            //     tokenUser: populatedTweet.user.tokenUser,
            //     tweet: populatedTweet.tweet,
            //     date: populatedTweet.date,
            //     trash: populatedTweet.trash,
            //     tokenTweet: populatedTweet.tokenTweet,
            //     like: populatedTweet.like,
            // }
            // envois de la réponse
            res.json({
                result: true
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
        //find all untrash tweet 
        const tweetData = await Tweet.find({ trash: false }).populate('user');
 console.log(tweetData);

const obj = tweetData.map(tweet => {
    const formattedDate = getTimeElapsed(tweet.date); // change the date to time spend
    // return tweets formated
    return {  
        firstname: tweet.user.firstname,
        username: '@' + tweet.user.username,
        avatar: tweet.user.avatar,
        tokenUser: tweet.user.tokenUser,
        tweet: tweet.tweet,
        date: formattedDate, 
        trash: tweet.trash,
        tokenTweet: tweet.tokenTweet,
        like: tweet.like,
        liker : tweet.liker
    };
});
    
        // console.log(tweetData)
        res.json({ result: true, tweets: obj })
    } catch (error) {
        // errors 
        res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }
})
//--------------------------------------------------------------------------
// Ubdapte liketweet/disLikeTweet Road
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

        // console.log('C\'est le user qui like:', userlike.username);

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

        // console.log('Liste des likers mise à jour:', tweetLike.liker);
        
        return res.json({ result: true, message: 'Action effectuée avec succès.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }
});


//--------------------------------------------------------------------------
// Ubdapte trashtweet Road
//--------------------------------------------------------------------------

router.put('/trashtweet/:tokenTweet/:tokenUser', async (req, res) => {
    try {    
        // look for user
        const usertrash = await User.findOne({ tokenUser: req.params.tokenUser });
        if (!usertrash) {
            return res.status(404).json({ result: false, message: 'Utiliuser not foundsateur non trouvé.' });
        }

        // look for the tweet
        const tweettrash = await Tweet.findOne({ tokenTweet: req.params.tokenTweet });
        if (!tweettrash) {
            return res.status(404).json({ result: false, message: 'Tweet not found.' });
        }

        // check if the user write the tweet to delete it
        if (tweettrash.user.toString() === usertrash._id.toString()) {
            tweettrash.trash = true; // trash from fale to true
            await tweettrash.save(); 
            console.log('Tweet is trash : tru');
        } else {
            return res.status(403).json({ result: false, message: 'user false.' });
        }

        return res.json({ result: true, message: 'the tweet is trash true.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ result: false, message: 'error.', error });
    }
});


//---------------------------------------------------------------------------------
//****************---------------------HASTAG---------------------****************/
//---------------------------------------------------------------------------------
router.get('/hashtag/', async (req, res) => {
    try {
        // Récupérer tous les hashtags avec les tweets associés
        const hashtagTweets = await Hashtag.find().populate({
            path: 'tweets',
            populate: { path: 'user', select: 'firstname username avatar tokenUser' } // Sélection des champs utiles de User
        });

        // Extraire les noms des hashtags
        const hashtags = hashtagTweets.map(hashtag => hashtag.name);

        if (!hashtags || hashtags.length === 0) {
            return res.status(404).json({ result: false, message: 'No hashtags found.' });
        }

        res.json({ result: true, hashtags: hashtags });
    } catch (error) {
        console.error('Erreur attrapée:', error);
        res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }
});


router.get('/hashtag/:name', async (req, res) => {
    try {
        const hashtagTweet = await Hashtag.findOne({ name: req.params.name })
            .populate({
                path: 'tweets',
                populate: { path: 'user', select: 'firstname username avatar tokenUser' } // Sélection des champs utiles de User
            });

        if (!hashtagTweet) {
            return res.status(404).json({ result: false, message: 'No Hashtag found, try another.' });
        }

        res.json({ result: true, tweets: hashtagTweet });
    } catch (error) {
        console.error('Erreur attrapée:', error);
        res.status(500).json({ result: false, message: 'Une erreur est survenue.', error });
    }
});

module.exports = router;