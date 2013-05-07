var Player = require('./player'),
    EventEmitter = process.EventEmitter;

var ai_next_id = 0;

function AI() {
    var newai = {
        id: "ai",
        cartype: 0,
        name: 'AI' + ai_next_id++ + '号',
        ip: {
            address: 'AI',
            port: '一般难度'
        },
        status: '已准备',
        isAI: true,
        room: null
    };
    newai.__proto__ = AI.prototype;
    return newai;
}

AI.prototype.run = function (game, keystatus) {
    
}

AI.prototype.__proto__ = Player.prototype;

exports = module.exports = AI;