function findhastag(text) {
    const regex = /#(\w+)/g;
    const hashtags = [];
    let match='';

    while ((match = regex.exec(text)) !== null) {
        hashtags.push(match[0].toLowerCase()); 
    }

    return [...new Set(hashtags)]; 
}

module.exports = {findhastag};