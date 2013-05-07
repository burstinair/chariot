var net = require("net"),
    adapter_socket = require('./socket');

var adapter_flash = {
    socket_list: [],
    options: null,
    start: function (options) {
        this.options = options;
    
        net.createServer(
            function(socket)
            {
                socket.write("<?xml version=\"1.0\"?>\n");
                socket.write("<!DOCTYPE cross-domain-policy SYSTEM \"http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd\">\n");
                socket.write("<cross-domain-policy>\n");
                socket.write("<allow-access-from domain=\"*\"to-ports=\"*\"/>\n");
                socket.write("</cross-domain-policy>\n\0");
                //socket.end();   
            }
        ).listen(options.socket_port);
        
        if(options.http_port) {
            app.listen(options.http_port);
            app.get('/', function (req, res) {
                res.sendfile(__dirname + '/flash/default.html');
            });
            app.configure(function () {
                app.use(express.bodyParser());
                app.use(express.methodOverride());
                app.use(express.static(__dirname + '/flash'));
            });
        }
    }
};

adapter_flash.__proto__ = adapter_socket;
exports = module.exports = adapter_flash;