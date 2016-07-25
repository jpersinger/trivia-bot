/*eslint no-console: 0*/
import Botkit from 'botkit';
var redisStorage = require('botkit-storage-redis')({});

// rule
import trivia from './trivia';

const token = process.env.token;

/**
 * Botkit controller
 */
 try {
var controller = Botkit.slackbot({
    debug: false,
    storage: redisStorage
});
}catch(err){console.log(err);}

/**
 * Fire her up
 */
controller.spawn({
    token
}).startRTM((err) => {
    if (err) {
        throw new Error(err);
    }
});

trivia(controller);
