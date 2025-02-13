const moment = require('moment');

function getTimeElapsed(tweetDate) {
    const now = moment();
    const diffInSeconds = now.diff(moment(tweetDate), 'seconds');
    const diffInMinutes = now.diff(moment(tweetDate), 'minutes');
    const diffInHours = now.diff(moment(tweetDate), 'hours');
    const diffInDays = now.diff(moment(tweetDate), 'days');

    if (diffInSeconds < 60) {
        return 'Few seconds ago';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        return `${diffInDays} days ago`;
    }
}

// Exemple d'utilisation
const tweetDate = "2025-02-13T22:34:53.000Z";
console.log(getTimeElapsed(tweetDate));


module.exports = { getTimeElapsed };
