"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.LCUApiWrapper = void 0;
var events_1 = require("events");
var request_promise_1 = __importDefault(require("request-promise"));
var ReconnectingWebSocket_1 = __importDefault(require("./internal/ReconnectingWebSocket"));
var league_connect_1 = require("league-connect");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
var LCUApiWrapper = /** @class */ (function (_super) {
    __extends(LCUApiWrapper, _super);
    function LCUApiWrapper() {
        var _this = _super.call(this) || this;
        _this.connected = false;
        _this.callbacks = new Map();
        _this.credentials = league_connect_1.authenticate({ awaitConnection: true }).then(function (credentials) {
            _this.connectWS(credentials);
            console.log("Credentials", credentials);
            _this.client = new league_connect_1.LeagueClient(credentials);
            console.log("Client", _this.client);
            _this.client.on("connect", function (newCredentials) {
                console.log("New Credentials", newCredentials);
                _this.ws.close();
                _this.connectWS(newCredentials);
            });
            _this.client.on("disconnect", function () {
                _this.ws.close();
            });
            _this.client.start();
        });
        return _this;
    }
    LCUApiWrapper.prototype.connectWS = function (credentials) {
        var _this = this;
        var authkey = Buffer.from("riot:" + credentials.password).toString('base64');
        this.authkey = authkey;
        this.user = "riot";
        this.password = credentials.password;
        this.port = credentials.port;
        console.log("Connected to LCU", credentials);
        this.ws = new ReconnectingWebSocket_1["default"]("wss://riot:" + this.password + "@127.0.0.1:" + this.port + "/", "wamp", {
            origin: "https://127.0.0.1:" + this.port,
            Host: "127.0.0.1:" + this.port,
            Authorization: "Basic " + authkey
        });
        this.ws.on('unexpected-response', function (msg) {
            console.log("unexpected message", msg);
        });
        this.ws.on('error', function (err) {
            console.log("error", err);
        });
        this.ws.on('message', function (msg) {
            var data = JSON.parse(msg);
            var callback = _this.callbacks.get(data[1]);
            if (callback != null)
                callback(data[2]);
        });
        this.ws.on('open', function () {
            _this.callbacks.forEach(function (value, key) {
                console.log(key + " subscribed to");
                _this.ws.send("[5, \"" + key + "\"]");
            });
            _this.connected = true;
        });
        this.ws.on('close', function () {
            _this.connected = false;
        });
        this.ws.connect();
    };
    LCUApiWrapper.prototype.start = function () {
    };
    LCUApiWrapper.prototype.subscribe = function (event, callback) {
        if (this.ws != null && this.ws.readyState() == 1) {
            this.ws.send("[5, \"" + event + "\"]");
        }
        this.callbacks.set(event, callback);
    };
    LCUApiWrapper.prototype.request = function (uri, callback, errorCallback) {
        request_promise_1["default"]({
            strictSSL: false,
            url: "https://" + this.user + ":" + this.password + "@127.0.0.1:" + this.port + "/" + uri
        })
            .then(function (response) { return callback(response); })["catch"](errorCallback);
        //.catch((err) => { console.log("Error in REST API Request.", err); });
    };
    LCUApiWrapper.getInstance = function () {
        if (!LCUApiWrapper.instance)
            LCUApiWrapper.instance = new LCUApiWrapper();
        return LCUApiWrapper.instance;
    };
    LCUApiWrapper.prototype.getConnectedStatus = function () {
        return this.connected;
    };
    return LCUApiWrapper;
}(events_1.EventEmitter));
exports.LCUApiWrapper = LCUApiWrapper;
//# sourceMappingURL=LCUApiWrapper.js.map