import fetch from 'node-fetch';
import WtoN from 'words-to-num';
var removeDiacritics = require('diacritics').remove;

const cleanAnswer = (answer) => {
    let text = answer.toLowerCase().replace(/[\\\'\".,\/#!$%\^&\*;:{}=_`~]/g,"");
    text = text.replace(/[\-]/g," ");
    text = text.replace(/ *\([^)]*\) */g, "");
    text = text.replace(/<i>/g, '');
    text = text.replace(/<b>/g, '');
    text = text.split(' ');
    let actualText = [];
    for (let sub in text) {
        text[sub] = text[sub].trim();
        text[sub] = removeDiacritics(text[sub]);
        let number = WtoN.convert(text[sub]);
        if (!isNaN(number)) {
            text[sub] = number;
        }
        if (text[sub] != 'a' && text[sub] != 'an' && text[sub] != 'the' && text[sub] != '' && text[sub] != 'and') {
            actualText.push(text[sub]);
        }
    }
    actualText = actualText.join('');
    return actualText;
}

const formatText = (text) => {
    let fText = text.replace(/<i>/g, '_');
    fText = fText.replace(/<\/i>/g, '_');
    fText = fText.replace(/<b>/g, '*');
    fText = fText.replace(/<\/b>/g, '*');
    return fText;
}

export default function (controller) {
    controller.hears('trivia', ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
        controller.storage.teams.get('trivia', (err, resp) => {
            if (resp == null || resp.data == null) {
                fetch('http://jservice.io/api/random')
                    .then((resp) => {
                        return resp.json();
                    }).then((json) => {
                        let fQuestion = formatText(json[0].question);
                        bot.reply(message, 'In the category _' + json[0].category.title + '_: ' +  fQuestion);
                        controller.storage.teams.save({id: 'trivia', data: {category: json[0].category.title, question: fQuestion, answer: json[0].answer}});
                    });
            } else {
                bot.reply(message, 'In the category _' + resp.data.category + '_: ' + resp.data.question);
            }
        });
    });

    controller.hears('', ['direct_message', 'direct_mention', 'mention', 'ambient'], function(bot, message) {
        controller.storage.teams.get('trivia', (err, resp) => {
            if (resp != null && resp.data != null) {
                let answer = cleanAnswer(resp.data.answer);
                let userAns = cleanAnswer(message.text);
                console.log(answer);
                if (userAns.indexOf(answer) !== -1) {
                    controller.storage.teams.save({id: 'trivia', data: null});
                    bot.api.users.info({token: bot.config.token, user: message.user}, (err, userData) => {
                        let formattedAns = formatText(resp.data.answer);
                        bot.reply(message, userData.user.profile.first_name + ' got it! The answer was: ' + formattedAns);
                    });
                }
            }
        });
    });
}
