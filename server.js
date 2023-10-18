import * as dotenv from 'dotenv'
import express from 'express'
import nunjucks from 'nunjucks'

dotenv.config()

const PORT = 8080
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_SEARCH_URL = `https://youtube.googleapis.com/youtube/v3/search?order=date&q=test%20ignore&type=video&maxResults=50&videoEmbeddable=any&key=${YOUTUBE_API_KEY}`

//don't overcall API. Update max every 5 minutes.
let lastCalledUpdateVideo = 0
let lastCalledUpdateList = 0
let currentVideoIDList = [
  'qKwSyQ0E2MU', 'VEDhPveofv0', 'wJQ-c8puy64', '-oYYkv4-_3E', 'LiGUDtcMQhE', 'qqcKUh5QJv0',
  'URIcltCDrnk', 'Z5pX_6OlgFA', 'OojFdgn6WFU', 'Z6SV1rX9rZQ', 'SM7PS2LfXYY', 'Ahal2BCaofo',
  '2Bf2UW6guwk', 'oNqMRO4N7fM', 'fo-TVP3IIvY', 'Z2LwSfwVObA', 'hUaiybWYzhs', 'EOoNTYlw5lk',
  'wsOnd22eQS4', 'ONOa5jaiGR8', 'iIJ1kMYQbbg', 'XqzhA0Xv3Ug', 'CnUGA8OVAWU', '_OT59eGen7A',
  'AV8n8MhFHX8', 'JnwB3l0_5rg', 'Q_9dHtCYoOo', 'yDONpKhXjq0', 'raSjvhOFsZc', 'cLtRshsDCl8',
  'QPxgcsWPbFw', 'LCC-AQS11-4', 'BnF6dezLTBw', '6njM1A9MMjM', 'cTLzRIdP688', 'OHvWMJWVtRI',
  'wfXI1xjyQ6Q', 'ubXCW6d1LNs', 'By2C5uCzqjA', '8TbunazUmTE', 'gdBLLwFaWRk', 'L8x7UBhJAiI',
  'sbaIwjZNiss', 'uFtYS41dMZM', '2cIjoxu6W7k', 'e-Sps-Edo7A', 'Rgb_TrNMoOQ', 'rm4BvHCjijk',
  'SSuc5S0Rxyk', '9rcDaAhPfyU'
]

const app = express()
nunjucks.configure('.', { express: app })

app.get('/', (req, res) => {
  const iframe = getVideoFrame(1)
  res.render('./index.html', { iframe })
})

app.get('/videos/:video_num', async (req, res) => {
  // Parse the video number, return BAD REQUEST if it fails
  let videoNum
  try {
    videoNum = parseInt(req.params.video_num)
  } catch (err) {
    console.error(`Failed to parse video_num ${req.params.video_num}`)
    return res.sendStatus(400)
  }

  const iframe = getVideoFrame(videoNum)
  const buttons = getButtons(videoNum)
  const html = `${iframe}\n${buttons}`
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

function getVideoFrame (videoNum) {
  const index = videoNum - 1
  const videoId = currentVideoIDList[index]
  return `
    <iframe id=video-iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1"
            hx-swap-oob=true>
    </iframe>
  `
}

function getPrefetchLink (videoNum) {
  const index = videoNum - 1
  const videoId = currentVideoIDList[index]
  return `<link rel=prefetch href="https://www.youtube.com/embed/${videoId}" as=document />`
}

function getButtons (videoNum) {
  let prevButton
  if (videoNum == 1) {
    prevButton = '<button disabled>Prev</button>'
  } else {
    prevButton = `<button hx-get=/videos/${videoNum - 1}>Prev</button>`
  }

  const nextButton = `<button id=next-button hx-get=/videos/${videoNum + 1}>Next</button>`
  const link = getPrefetchLink(videoNum + 2)
  return `${prevButton}\n${nextButton}\n${link}`
}
