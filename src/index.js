/*eslint no-console: 0*/
import Botkit from 'botkit';
var redisStorage = require('botkit-storage-redis')({});

// rule
import trivia from './trivia';

const token = 'xoxb-62313389875-TSkzYj77hGq4fwTXfReut1gA';

/**
 * Botkit controller
 */
var controller = Botkit.slackbot({
    debug: false,
    storage: redisStorage
});

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
