require('dotenv').config()
const linebot = require('linebot')
const rp = require('request-promise')

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

const rand = async () => {
  let result = {}
  try {
    const data = await rp({ uri: 'https://api.kento520.tw/zack/?rand', json: true })
    result = { success: true, data }
  } catch (error) {
    result = { success: false, data: '發生錯誤' }
  }
  return result
}

const genText = async (text) => {
  let result = ''
  try {
    const data = await rp({ uri: encodeURI('https://asia-northeast1-zack-essay.cloudfunctions.net/convert?q=' + text), json: true })
    result = data.result
  } catch (error) {
    console.log(error.message)
    result = '發生錯誤'
  }
  return result
}

bot.on('message', async (event) => {
  const msg = event.message.text
  const reply = []
  try {
    if (msg) {
      if (msg === '!zack randimg') {
        const result = await rand()
        if (result.success) {
          reply.push({
            type: 'image',
            originalContentUrl: result.data.image,
            previewImageUrl: result.data.image
          })
        } else {
          reply.push({ type: 'text', text: result.data })
        }
      } else if (msg === '!zack rand') {
        const result = await rand()
        console.log(result)
        reply.push({
          type: 'text',
          text: result.data.description
        })
        reply.push({
          type: 'image',
          originalContentUrl: result.data.image,
          previewImageUrl: result.data.image
        })
        reply.push({
          type: 'text',
          text: result.data.link
        })
      } else if (msg.substring(0, 6) === '!zack ') {
        const text = msg.split('!zack ')[1]
        const data = await genText(text)
        reply.push({
          type: 'text',
          text: data
        })
      }
    }
  } catch (error) {
    console.log(error.message)
    reply.push({
      type: 'text',
      text: '發生錯誤'
    })
  }
  console.log(reply)
  event.reply(reply)
})

bot.listen('/', process.env.PORT, () => {
  console.log(`Bot is ready in ${process.env.PORT}`)
})
