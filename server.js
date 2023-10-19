import * as dotenv from 'dotenv'
import express from 'express'
import nunjucks from 'nunjucks'

if (process.env.NODE_ENV === 'development') dotenv.config()

const PORT = 8080
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const YOUTUBE_SEARCH_URL = `https://youtube.googleapis.com/youtube/v3/search?order=date&q=test%20ignore&type=video&maxResults=50&videoEmbeddable=any&key=${YOUTUBE_API_KEY}`

let currentVideoIDList = []

const app = express()
nunjucks.configure('.', { express: app })
await refreshSearch()

app.use('/static', express.static('static'))

app.get('/', (_req, res) => {
  const iframe = getVideoFrame(1)
  res.render('./views/index.html', { iframe })
})
app.get('/about', (_req, res) => { res.render('./views/about.html') })


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
  console.log(`Listening on http://localhost:${PORT}`)
})

async function refreshSearch () {
  try {
    const apiRes = await fetch(YOUTUBE_SEARCH_URL)
    if (apiRes.status !== 200) {
      const text = await apiRes.text()
      console.error(text)
      throw new Error('Failed to fetch initial search results from the API')
    }
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
