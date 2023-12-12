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
var events_1 = __importDefault(require("events"));
var ws_1 = __importDefault(require("ws"));
var ReconnectingWebSocket = /** @class */ (function (_super) {
    __extends(ReconnectingWebSocket, _super);
    function ReconnectingWebSocket(url, protocol, options, reconnectingInterval) {
        if (reconnectingInterval === void 0) { reconnectingInterval = 5000; }
        var _this = _super.call(this) || this;
        /** is connection close manually by code. */
        _this.manualClosed = false;
        /** ws server url */
        _this.wsServerUrl = '';
        _this.wsProtocol = '';
        _this.wsOptions = {};
        _this.wsServerUrl = url;
        _this.wsProtocol = protocol;
        _this.wsOptions = options;
        _this.reconnectingInterval = reconnectingInterval;
        return _this;
    }
    ReconnectingWebSocket.prototype.connect = function () {
        var _this = this;
        this.webSocket = new ws_1["default"](this.wsServerUrl, this.wsProtocol, this.wsOptions);
        this.webSocket.on('open', function () { _this.onOpen(); });
        this.webSocket.on('error', function (err) { _this.onError(err); });
        this.webSocket.on('message', function (data) { _this.onMessage(data); });
        this.webSocket.on('close', function (code, reason) { _this.onClose(code, reason); });
    };
    ReconnectingWebSocket.prototype.onOpen = function () {
        console.log("websocket successfully opened");
        this.emit('open');
    };
    ReconnectingWebSocket.prototype.onMessage = function (data) {
        this.emit("message", data);
    };
    ReconnectingWebSocket.prototype.onError = function (err) {
        console.log("error with web-socket " + err.message);
        /** If connection closed manually, return. */
        if (this.manualClosed) {
            return;
        }
        /** Close connection, and let reconnect do the magic. */
        this.webSocket.close();
    };
    ReconnectingWebSocket.prototype.onClose = function (code, reason) {
        console.log("websocket closed with code " + code + " reason: " + reason);
        this.emit('close', code, reason);
        /** If connection closed manually, return. */
        if (this.manualClosed) {
            return;
        }
        /** Try to reconnect */
        this.reconnect();
    };
    ReconnectingWebSocket.prototype.reconnect = function () {
        var _this = this;
        this.webSocket.removeAllListeners();
        /** Wait reconnectingInterval time */
        setTimeout(function () {
            /** If connection closed manually, and the timeout already in queue abort re-connecting. */
            if (_this.manualClosed) {
                return;
            }
            console.log("Trying to reconnect to the web-socket server...");
            _this.emit('reconnect');
            /** Connect again with the same url */
            _this.connect();
        }, this.reconnectingInterval);
    };
    ReconnectingWebSocket.prototype.send = function (data) {
        this.webSocket.send(data);
    };
    ReconnectingWebSocket.prototype.close = function () {
        this.manualClosed = true;
        this.webSocket.close();
    };
    ReconnectingWebSocket.prototype.readyState = function () {
        return this.webSocket.readyState;
    };
    return ReconnectingWebSocket;
}(events_1["default"]));
exports["default"] = ReconnectingWebSocket;
//# sourceMappingURL=ReconnectingWebSocket.js.map