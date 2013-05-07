var Config = {
    fps: 15,
    networks: [
        {module: './adapter/web', port: 8050}//,
        //{module: './adapter/socket', port: 8060}//,
        //{module: './adapter/flash', http_port: 8070, socket_port: 8071}
        //{module: './adapter/flash', socket_port: 8071}
    ]
};

exports = module.exports = Config;