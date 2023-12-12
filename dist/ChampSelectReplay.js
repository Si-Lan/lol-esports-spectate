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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ChampionSelectReplay = void 0;
var fs = __importStar(require("fs"));
var events_1 = __importDefault(require("events"));
var ChampionSelectReplay = /** @class */ (function (_super) {
    __extends(ChampionSelectReplay, _super);
    function ChampionSelectReplay(replay_file) {
        var _this = _super.call(this) || this;
        try {
            var data = fs.readFileSync(replay_file);
            _this.replay = JSON.parse(data.toString());
        }
        catch (err) {
            console.error(err);
        }
        _this.callbacks = new Map();
        return _this;
    }
    ChampionSelectReplay.prototype.request = function (uri, callback) {
        throw new Error("Method not implemented.");
    };
    ChampionSelectReplay.prototype.start = function () {
        var dataJSONs = this.replay.jsons;
        var callback = this.callbacks.get("OnJsonApiEvent_lol-champ-select_v1_session");
        dataJSONs.forEach(function (replayEvent) {
            var timeOffset = replayEvent.time;
            var data = replayEvent.data;
            // setTimeout((callback,data),timeOffset);
            setTimeout(function () {
                callback(data);
            }, timeOffset);
        });
    };
    ChampionSelectReplay.prototype.subscribe = function (event, callback) {
        this.callbacks.set(event, callback);
    };
    ChampionSelectReplay.prototype.getConnectedStatus = function () {
        return false;
    };
    return ChampionSelectReplay;
}(events_1["default"]));
exports.ChampionSelectReplay = ChampionSelectReplay;
//# sourceMappingURL=ChampSelectReplay.js.map