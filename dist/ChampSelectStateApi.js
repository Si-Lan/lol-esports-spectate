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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ChampSelectStateApi = void 0;
var LCUApiWrapper_1 = require("./LCUApiWrapper");
var path = __importStar(require("path"));
var ChampSelectReplay_1 = require("./ChampSelectReplay");
var tiny_typed_emitter_1 = require("tiny-typed-emitter");
var fs_1 = __importDefault(require("fs"));
var ChampSelectStateApi = /** @class */ (function (_super) {
    __extends(ChampSelectStateApi, _super);
    function ChampSelectStateApi(replay, replay_file, options) {
        var _this = _super.call(this) || this;
        _this.pickOrderState = null;
        _this.start = 0;
        _this.options = {
            recordReplays: false,
            replayFolder: null
        };
        _this.autoConvertMapToObject = function (map) {
            var obj = {};
            for (var _i = 0, _a = __spreadArray([], map); _i < _a.length; _i++) {
                var item = _a[_i];
                var key = item[0], value = item[1];
                obj[key] = value;
            }
            return obj;
        };
        _this.summonerNameMap = new Map();
        _this.jsonData = { jsons: [] };
        _this.replay = replay;
        if (options) {
            _this.options = options;
        }
        if (replay) {
            var replayBuf = fs_1["default"].readFileSync(replay_file);
            var replayJson = JSON.parse(replayBuf.toString());
            if (replayJson.summonerNameMap)
                _this.summonerNameMap = new Map(Object.entries(replayJson.summonerNameMap).map(function (entry) { return [parseInt(entry[0]), entry[1]]; }));
            _this.leagueApi = new ChampSelectReplay_1.ChampionSelectReplay(replay_file = replay_file);
        }
        else {
            _this.leagueApi = new LCUApiWrapper_1.LCUApiWrapper();
        }
        _this.leagueApi.subscribe("OnJsonApiEvent_lol-champ-select_v1_session", _this.champSelectEventCallback.bind(_this));
        _this.leagueApi.start();
        if (_this.leagueApi instanceof LCUApiWrapper_1.LCUApiWrapper) {
            _this.getSummonersRequestIntervall = setInterval(function () {
                _this.leagueApi.request("lol-lobby/v2/lobby/members", function (data) {
                    var members = JSON.parse(data);
                    Array.prototype.forEach.call(members, function (member, idx) {
                        // console.log(member)
                        _this.leagueApi.request("lol-summoner/v1/summoners/" + member.summonerId, function (data) {
                            var summoner = JSON.parse(data);
                            if (!_this.summonerNameMap.has(member.summonerId))
                                _this.summonerNameMap.set(member.summonerId, summoner.gameName);
                        });
                    });
                }, function () {
                    (function (err) { return console.error("Error getting summoner names. Trying again in 5 seconds."); });
                });
            }, 5000);
        }
        return _this;
    }
    ChampSelectStateApi.prototype.stop = function () {
        clearInterval(this.getSummonersRequestIntervall);
    };
    ChampSelectStateApi.prototype.champSelectEventCallback = function (eventData) {
        if (eventData.eventType === "Delete") {
            //End of champion select
            this.emit("championSelectEnd");
        }
        else if (eventData.eventType === "Create") {
            this.emit("championSelectStarted");
            this.pickOrderState = null;
            this.jsonData = { jsons: [] };
            this.start = Date.now();
        }
        else {
            var state = this.parseData(eventData);
            this.emit("newState", state);
            if (this.pickOrderState === null && eventData.data.timer.phase === "FINALIZATION") {
                this.pickOrderState = state;
                // console.log(eventData)
                this.emit("newPickOrder", this.pickOrderState);
            }
        }
        this.jsonData.jsons.push({ time: Date.now() - this.start, data: eventData });
        if (!this.replay && this.options.recordReplays && eventData.eventType === "Delete") {
            this.jsonData.summonerNameMap = Object.fromEntries(this.summonerNameMap);
            var now = Date.now();
            var fs = require('fs');
            var replayFileName = 'replay_' + now + '.json';
            if (!this.options.replayFolder) {
                throw new Error("No replay folder specified");
            }
            var logFilePath = path.join(this.options.replayFolder, replayFileName);
            if (!fs.existsSync(this.options.replayFolder)) {
                fs.mkdirSync(this.options.replayFolder);
            }
            fs.writeFile(logFilePath, JSON.stringify(this.jsonData), 'utf8', function (err) {
                if (err)
                    throw err;
                console.log('The replay file has been saved!');
            });
        }
    };
    ChampSelectStateApi.prototype.parseData = function (eventData) {
        if (eventData.eventType === "Delete")
            return this.lastState;
        var data = eventData.data;
        // console.log(data)
        var state = {
            started: true,
            bluePicks: [],
            redPicks: [],
            blueBans: [],
            redBans: [],
            time: 60,
            actingSide: "none",
            timestamp: 0,
            phase: "",
            turnId: 0
        };
        var blueBanCounter = 0;
        var redBanCounter = 0;
        var bluePickCounter = 0;
        var redPickCounter = 0;
        var currentActionIsAlly = false;
        var myTeam = data.myTeam;
        for (var i = 0; i < data.myTeam.length; i++) {
            var pick = { championId: myTeam[i].championId, isCompleted: false, isPicking: false, spellId1: myTeam[i].spell1Id, spellId2: myTeam[i].spell2Id, summonerName: this.summonerNameMap.get(myTeam[i].summonerId) };
            state.bluePicks[i] = pick;
        }
        var theirTeam = data.theirTeam;
        for (var i = 0; i < data.theirTeam.length; i++) {
            var pick = { championId: theirTeam[i].championId, isCompleted: false, isPicking: false, spellId1: theirTeam[i].spell1Id, spellId2: theirTeam[i].spell2Id, summonerName: this.summonerNameMap.get(theirTeam[i].summonerId) };
            state.redPicks[i] = pick;
        }
        for (var i = 0; i < data.bans.numBans / 2; i++) {
            var banBlue = { championId: 0, isActive: false, isCompleted: false };
            var banRed = { championId: 0, isActive: false, isCompleted: false };
            state.blueBans[i] = banBlue;
            state.redBans[i] = banRed;
        }
        data.actions.forEach(function (action) {
            var actionData = action[0];
            if (actionData.type === "ban") {
                var ban = { championId: actionData.championId, isCompleted: actionData.completed, isActive: actionData.isInProgress };
                if (actionData.isAllyAction) {
                    state.blueBans[blueBanCounter].championId = actionData.championId;
                    state.blueBans[blueBanCounter].isActive = actionData.isInProgress;
                    state.blueBans[blueBanCounter].isCompleted = actionData.completed;
                    blueBanCounter++;
                }
                else {
                    state.redBans[redBanCounter].championId = actionData.championId;
                    state.redBans[redBanCounter].isActive = actionData.isInProgress;
                    state.redBans[redBanCounter].isCompleted = actionData.completed;
                    redBanCounter++;
                }
            }
            else if (actionData.type === "pick") {
                if (actionData.isAllyAction) {
                    state.bluePicks[bluePickCounter].isCompleted = actionData.completed;
                    state.bluePicks[bluePickCounter].isPicking = actionData.isInProgress;
                    bluePickCounter++;
                }
                else {
                    state.redPicks[redPickCounter].isCompleted = actionData.completed;
                    state.redPicks[redPickCounter].isPicking = actionData.isInProgress;
                    redPickCounter++;
                }
            }
            if (actionData.isInProgress)
                currentActionIsAlly = actionData.isAllyAction;
        });
        if (data.timer.phase === "BAN_PICK") {
            if (data.actions[data.actions.length - 1][0].type === "ban") { //BAN PHASE
                state.phase = "Ban Phase";
            }
            else { //PICK PHASE
                state.phase = "Pick Phase";
            }
        }
        else {
            state.phase = "";
        }
        state.time = Math.trunc(data.timer.adjustedTimeLeftInPhase / 1000);
        if (data.timer.phase === "BAN_PICK") {
            if (currentActionIsAlly)
                state.actingSide = "blue";
            else
                state.actingSide = "red";
        }
        else {
            state.actingSide = "none";
        }
        state.timestamp = data.timer.internalNowInEpochMs;
        var turnID = 0;
        for (var i = 0; i < data.actions.length; i++) {
            if (data.actions[i][0].isInProgress) {
                break;
            }
            turnID++;
        }
        state.turnId = turnID;
        this.lastState = state;
        return state;
    };
    ChampSelectStateApi.prototype.getConnectionStatus = function () {
        if (!this.leagueApi)
            return "Not connected";
        if (this.replay)
            return "Replay";
        if (this.leagueApi.getConnectedStatus())
            return "Connected";
        return "Not connected";
    };
    return ChampSelectStateApi;
}(tiny_typed_emitter_1.TypedEmitter));
exports.ChampSelectStateApi = ChampSelectStateApi;
//# sourceMappingURL=ChampSelectStateApi.js.map