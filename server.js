const express = require('express')
const app = express()
const port = 3000
const fetch = require('node-fetch')
require('dotenv').config()
const path = require('path');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
console.log(YOUTUBE_API_KEY)

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
  });
  
  

//don't overcall API. Update max every 5 minutes.
let lastCalled = 0
let currentVideoID = ''


//get relevant youtube data
const updateVideoID = async () => {
    //get current time
    let currentTime = Date.now();
    //if current time is within 5 minutes of last call, return last video id
    if (currentTime - lastCalled < (1000 * 60 *5)) return currentVideoID
    //else, get the new info from fetch
    const newVideoID = await fetch(`https://youtube.googleapis.com/youtube/v3/search?order=date&q=test%20ignore&type=video&videoEmbeddable=any&key=${YOUTUBE_API_KEY}`)
        .then(res => res.json())
        .then(data => {
            console.log('in fetch')
            currentVideoID = data.items[0].id.videoId
            return currentVideoID})
        .catch(error => {
            console.log('ERROR in getData fetch:', error)
            return currentVideoID
        })
    console.log(newVideoID)
    return newVideoID
}

const makeIFrame = () => {
    return `<iframe style="width: 100%; height : 100%; display:block; margin: auto"
    src="https://www.youtube.com/embed/${currentVideoID}">
    </iframe> <br/> <p><i>Not on our watch. </br>-WMI</i></p>`
}

app.get('/recentVid', async (req, res) => {
    await updateVideoID()
    console.log('about to send', currentVideoID)
    res.send(makeIFrame())
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})