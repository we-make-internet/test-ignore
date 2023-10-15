const express = require('express')
const path = require('node:path')

require('dotenv').config()

const PORT = 8080
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_SEARCH_URL = `https://youtube.googleapis.com/youtube/v3/search?order=date&q=test%20ignore&type=video&maxResults=50&videoEmbeddable=any&key=${YOUTUBE_API_KEY}`

//don't overcall API. Update max every 5 minutes.
let lastCalledUpdateVideo = 0
let lastCalledUpdateList = 0
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

const app = express()
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/splash', async (req, res) => {
  const iframe = getVideoFrame(0)
  res.send(iframe)
})

app.get('/videos/:video_num', async (req, res) => {
  const index = req.params.video_num - 1
  const iframe = getVideoFrame(index)
  const button = `<button hx-get="/videos/${index + 2}" hx-swap=outerHTML>Next</button>`
  const html = `${iframe}\n${button}`
  res.send(html)
})

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}`)
})

async function refreshSearch () {
  //if current time is within 5 minutes of last call, don't refres
  if (currentTime - lastCalledUpdateVideo < (1000 * 60 *5)) return
  //else, get the new info from fetch
  try {
    const apiRes = await fetch(YOUTUBE_SEARCH_URL)
    const data = await apiRes.json()
    currentVideoIDList = data.items.map(el => el.id.videoId)
  } catch (err) {
    console.error(err)
  }
}

function getVideoFrame (index = 0) {
  const videoId = currentVideoIDList[index]
  return `
    <iframe id=video-iframe
            src="https://www.youtube.com/embed/${videoId}"
            hx-swap-oob=true>
    </iframe>
  `
}

async function getReverseSortedVideoViewList () {
  let currentTime = Date.now()
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
