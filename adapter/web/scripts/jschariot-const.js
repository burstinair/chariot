(function ($, window) {

window.STATUS_LOADING =  10;
window.STATUS_RUNNING = 20;
window.STATUS_TIMEOUT = 30;
window.STATUS_WIN = 40;
window.STATUS_LOSE = 50;
window.STATUS_DIE = 60;

window.GAME_WIDTH = 920;
window.GAME_HEIGHT = 600;

window.INDEX_EVENTS = 0;
window.INDEX_MAP_TYPE = 1;
window.INDEX_BOXES = 2;
window.INDEX_HP = 3;
window.INDEX_CARS = 4;
window.INDEX_MISSILES = 5;
window.INDEX_TRAPS = 6;
window.INDEX_INDEX = 7;
window.INDEX_V = 8;
window.INDEX_ITEMS = 9;
window.INDEX_CD = 10;

window.INDEX_X = 0;
window.INDEX_Z = 1;
window.INDEX_D = 2;
window.INDEX_DA = 3;
window.INDEX_OWNER = 3;
window.INDEX_TYPE = 4;

window.GAME_START = 'gs';
window.GAME_END = 'ge';
window.GAME_REFRESH = 'gr';

window.EVENT_GAME_END = "ge";
window.EVENT_DRAW = "gd";

})(jQuery, window);