const TelegramBot = require('node-telegram-bot-api');

const token = '1124541868:AAHBjkJMrAvCqC22wX-D7KpOGFtAKwj5i6Y';

const bot = new TelegramBot(token, { polling: true });


let leaders = {};
var fs = require("fs");
console.log("\n *STARTING* \n");
var contents = fs.readFileSync("sorban.json");
var jsonContent = JSON.parse(contents);

let systemOnOff = "Off";
bot.onText(/\/sualci (.+)/, (msg, match) => {

  console.log('object :>> ', jsonContent[2]['q']);
  const chatId = msg.chat.id;
  const resp = match[1];

  if (resp == 'start') {
    systemOnOff = "On";
  } else if (resp == 'stop') {
    systemOnOff = "Off";
  } else if (resp == 'board') {
    bot.sendMessage(msg.chat.id, "Puanlar:  " + JSON.stringify(leaders));
  } else if (resp == 'info') {
    bot.sendMessage(msg.chat.id, "mailto : fuat.cakir@outlook.com");
  }

});


let askedSeqNo = 1;
let answeredRight = false;
let question = {};
let answerLength = 1;
let hintCount = 0;

bot.on('message', (msg) => {
  console.log('msg income ', msg);
  if (systemOnOff == "On" && !(msg.text.toString().includes('board') || msg.text.toString().includes('info') )) {


    console.log('msg income ');
    const chatId = msg.chat.id;
    console.log('msg msg.chat.id ' + chatId);
    if (question['a']) {
      if (isAnswerRight(question['a'], msg.text.toString())) {
        console.log('DOGRU');
        answeredRight = true;
        bot.sendMessage(msg.chat.id, "Doğru Cevap  " + msg.from.first_name);
        if (leaders[msg.from.first_name]) {
          leaders[msg.from.first_name] = leaders[msg.from.first_name] + 1;
        } else {
          leaders[msg.from.first_name] = 1;
        }


        console.log('soru geliyor');
        while (true) {
          askedSeqNo = randomIntInc(1, 2345);
          question = jsonContent[askedSeqNo];
          if (question) {
            break;
          } else {
            askedSeqNo = randomIntInc(1, 2345);
            question = jsonContent[askedSeqNo];
          }
        }
        bot.sendMessage(chatId, "Soru : " + question['q'] + " ?");
        hintCount = 0;
      } else {
        answeredRight = false;
        console.log('yanlis cevap');
        bot.sendMessage(chatId, "Yanlış Cevap  " + msg.from.first_name);

        hintCount++;

        if (hintCount % 2 == 0) {
          let hintindx = hintCount / 2;
          if (question['a'].slice(0, hintindx) == question['a']) {
            answeredRight = true;
            bot.sendMessage(chatId, "Doğru  Cevap : " + question['a'].toLowerCase());

            console.log('soru geliyor');
            while (true) {
              askedSeqNo = randomIntInc(1, 2345);
              question = jsonContent[askedSeqNo];
              if (question) {
                break;
              } else {
                askedSeqNo = randomIntInc(1, 2345);
                question = jsonContent[askedSeqNo];
              }
            }

            bot.sendMessage(chatId, "Soru : " + question['q'] + " ?");
            hintCount = 0;

          } else {
            console.log('ipucu veriliyor ');
            answeredRight = false;
            answerLength = question['a'].length + 1;
            bot.sendMessage(chatId, "ipucu : " + question['a'].substr(0, hintindx).padEnd(question['a'].length, "*"));
          }
        }

      }
    } else {
      console.log('yeni soru veriliyor ');
      while (true) {
        askedSeqNo = randomIntInc(1, 2345);
        question = jsonContent[askedSeqNo];
        if (question) {
          break;
        } else {
          askedSeqNo = randomIntInc(1, 2345);
          question = jsonContent[askedSeqNo];
        }
      }
      bot.sendMessage(chatId, "Soru : " + question['q']);
    }
  }
});

function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

function isAnswerRight(rightAnswer, entriedAnswer) {
  return Cevir(rightAnswer) == Cevir(entriedAnswer);
}

function Cevir(text) {
  var trMap = {
    'çÇ': 'c',
    'ğĞ': 'g',
    'şŞ': 's',
    'üÜ': 'u',
    'ıİ': 'i',
    'öÖ': 'o'
  };
  for (var key in trMap) {
    text = text.replace(new RegExp('[' + key + ']', 'g'), trMap[key]);
  }
  return text.replace(/[^-a-zA-Z0-9\s]+/ig, '')
    .replace(/\s/gi, "-")
    .replace(/[-]+/gi, "-")
    .toLowerCase();

}
