const express = require('express')
const app = express()
const port = 6969
require('dotenv').config()
const path = require('path');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
  });



//don't overcall API. Update max every 5 minutes.
let lastCalledUpdateVideo = 0
let lastCalledUpdateList = 0
let currentVideoID = ''
// let currentVideoIDList = []
let currentVideoIDList = [
  'qKwSyQ0E2MU', 'VEDhPveofv0', 'wJQ-c8puy64',
  '-oYYkv4-_3E', 'LiGUDtcMQhE', 'qqcKUh5QJv0',
  'URIcltCDrnk', 'Z5pX_6OlgFA', 'OojFdgn6WFU',
  'Z6SV1rX9rZQ', 'SM7PS2LfXYY', 'Ahal2BCaofo',
  '2Bf2UW6guwk', 'oNqMRO4N7fM', 'fo-TVP3IIvY',
  'Z2LwSfwVObA', 'hUaiybWYzhs', 'EOoNTYlw5lk',
  'wsOnd22eQS4', 'ONOa5jaiGR8', 'iIJ1kMYQbbg',
  'XqzhA0Xv3Ug', 'CnUGA8OVAWU', '_OT59eGen7A',
  'AV8n8MhFHX8', 'JnwB3l0_5rg', 'Q_9dHtCYoOo',
  'yDONpKhXjq0', 'raSjvhOFsZc', 'cLtRshsDCl8',
  'QPxgcsWPbFw', 'LCC-AQS11-4', 'BnF6dezLTBw',
  '6njM1A9MMjM', 'cTLzRIdP688', 'OHvWMJWVtRI',
  'wfXI1xjyQ6Q', 'ubXCW6d1LNs', 'By2C5uCzqjA',
  '8TbunazUmTE', 'gdBLLwFaWRk', 'L8x7UBhJAiI',
  'sbaIwjZNiss', 'uFtYS41dMZM', '2cIjoxu6W7k',
  'e-Sps-Edo7A', 'Rgb_TrNMoOQ', 'rm4BvHCjijk',
  'SSuc5S0Rxyk', '9rcDaAhPfyU'
]
let currentVideoIDObjects = []


//get relevant youtube data
const updateVideoID = async () => {
    //get current time
    let currentTime = Date.now();
    //if current time is within 5 minutes of last call, return last video id
    if (currentTime - lastCalledUpdateVideo < (1000 * 60 *5)) return currentVideoID
    //else, get the new info from fetch
    const newVideoID = await fetch(`https://youtube.googleapis.com/youtube/v3/search?order=date&q=test%20ignore&type=video&maxResults=50&videoEmbeddable=any&key=${YOUTUBE_API_KEY}`)
        .then(res => res.json())
        .then(data => {
            currentVideoID = data.items[0].id.videoId
            currentVideoIDList = data.items.map(el => el.id.videoId)
            return currentVideoID})
        .catch(error => {
            return currentVideoID
        })
    return newVideoID
}

const makeIFrame = () => {
    return `<iframe style="width: 100%; height : 100%; display:block; margin: auto"
    src="https://www.youtube.com/embed/${currentVideoID}">
    </iframe> <br/> <p><i>Not on our watch. </br>-WMI</i></p>`
}

const getReverseSortedVideoViewList = async () => {
    let currentTime = Date.now();
    //if current time is within 5 minutes of last call, return last video id
    if (currentTime - lastCalledUpdateList < (1000 * 60 *5)) return currentVideoList
    //else, get the new info from fetch
    let idString = ''
    currentVideoIDList.forEach(el => {
        idString += `${el}%2C`
    })
    idString = idString.slice(0,-3)
    const newVideoID = await fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=${idString}&key=${YOUTUBE_API_KEY}`)
        .then(res => res.json())
        .then(data => {
            // currentVideoID = data.items[0].id.videoId
            return currentVideoID})
        .catch(error => {
            console.log('ERROR in getData fetch:', error)
            return currentVideoID
        })
    return newVideoID
}

getReverseSortedVideoViewList()

app.get('/recentVid', async (req, res) => {
    await updateVideoID()
    res.send(makeIFrame())
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
