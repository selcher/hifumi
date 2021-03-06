var Botkit = require('botkit')
var gifSearch = require('gif-search')

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode
// if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token,
    retry: Infinity
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode
// setup beep boop resourcer connection
} else {
  console.log('Starting in multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

/**
 * Event listeneres
 */
controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.on('slash_command', function(bot, message) {
  // TODO: Check 500 service error
  console.log('Slash command received', message)
  bot.reply(message, 'command received')
})

/**
 * Message listeneres
 */

// Message: hello
controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

// Message: help
controller.hears('help', ['direct_message', 'direct_mention'], function (bot, message) {
  var help = 'I will respond to the following messages: \n' +
      '`bot hi` for a simple message.\n' +
      '`bot attachment` to see a Slack attachment message.\n' +
      '`@<your bot\'s name>` to demonstrate detecting a mention.\n' +
      '`bot help` to see this again.'
  bot.reply(message, help)
})

// Message: Attachment
controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Attachment'
  var attachments = [{
    fallback: text,
    pretext: '...',
    title: 'Hifumi',
    image_url: 'https://cldup.com/zOuxvWMWp2.jpg',
    title_link: 'https://github.com/selcher/hifumi',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

// Message: Gif
controller.hears('gif', ['direct_message', 'direct_mention'], function (bot, message) {
  var txtList = message.text.split(' ')
  var words = txtList.slice(1).join(' ')

  console.log('Gif search:', words)

  gifSearch.random(words).then(
      function(gifUrl) {
        bot.reply(message, gifUrl)
      }
  )
})

// Message: Default
controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
