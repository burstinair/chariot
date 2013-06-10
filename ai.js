var Player = require('./player'),
    ModelManager = require('./model_manager'),
    EventEmitter = process.EventEmitter;

var ai_next_id = 0;

function AI() {
    var newai = {
        id: "ai",
        car_type: ModelManager.random_car().id,
        name: 'AI' + ai_next_id++ + '号',
        ip: {
            address: 'AI',
            port: '一般难度'
        },
        status: '已准备',
        isAI: true,
        room: null,
        team: null
    };
    newai.__proto__ = AI.prototype;
    return newai;
}

AI.prototype.run = function (game, keystatus) {
    
}

AI.prototype.__proto__ = Player.prototype;

exports = module.exports = AI;