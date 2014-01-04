(function ($, window) {

window.FIRST_LOADING_EXTRA_TIME = 1000;
window.LOADING_EXTRA_TIME = 200;

window.TEAM_COLORS = [0xcc6666, 0x6666cc, 0x66cc66, 0x666666, 0xcccc66, 0xcc66cc, 0x66cccc, 0xcccccc];

window.STATUS_LOADING =  10;
window.STATUS_RUNNING = 20;
window.STATUS_TIMEOUT = 30;
window.STATUS_WIN = 40;
window.STATUS_LOSE = 50;
window.STATUS_DIE = 60;

window.GAME_WIDTH = 920;
window.GAME_HEIGHT = 600;

window.INDEX_EVENTS = 0;
//window.INDEX_MAP_TYPE = 1;
window.INDEX_BOXES = 1;
window.INDEX_HP = 2;
window.INDEX_CARS = 3;
window.INDEX_MISSILES = 4;
window.INDEX_TRAPS = 5;
window.INDEX_INDEX = 6;
window.INDEX_V = 7;
window.INDEX_ITEMS = 8;
window.INDEX_CD = 9;

window.INDEX_X = 0;
window.INDEX_Z = 1;
window.INDEX_D = 2;
window.INDEX_DA = 3;
window.INDEX_OWNER = 3;
window.INDEX_CAR_STATUS = 4;
window.INDEX_CAR_ID = 5;

window.CAR_STATUS_NORMAL = 0;
window.CAR_STATUS_HOODS = 1;

window.DA_NORMAL = 0;
window.DA_RIGHT = 1;
window.DA_LEFT = -1;

window.GAME_START = 'gs';
window.GAME_END = 'ge';
window.GAME_REFRESH = 'gr';

window.EVENT_GAME_END = "ge";
window.EVENT_DRAW = "gd";
window.EVENT_CAR_HIT_WALL = "chw";
window.EVENT_CAR_HIT_CAR = "chc";
window.EVENT_MISSILE_HIT_WALL = "mhw";
window.EVENT_HIT_MISSILE = "hm";
window.EVENT_HIT_TRAP = "ht";
window.EVENT_GET_ITEM = "gi";
window.EVENT_LAUNCH_MISSILE = "lm";
window.EVENT_LAY_TRAP = "lt";
window.EVENT_OPEN_HOODS = "oh";
window.EVENT_HIT_HOODS = "hh";
window.EVENT_DRIFT = "dft";

window.TYPE_PLAYER = 0;
window.TYPE_AI_PLAYER = 1;
window.TYPE_AI_SERVER = 2;

})(jQuery, window);