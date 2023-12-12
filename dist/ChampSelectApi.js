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
exports.ChampSelectApi = void 0;
var LCUApiWrapper_1 = require("./LCUApiWrapper");
var events_1 = __importDefault(require("events"));
var path = __importStar(require("path"));
var ChampSelectReplay_1 = require("./ChampSelectReplay");
var ChampSelectApi = /** @class */ (function (_super) {
    __extends(ChampSelectApi, _super);
    function ChampSelectApi(replay, replay_file, log_path) {
        if (replay === void 0) { replay = false; }
        if (replay_file === void 0) { replay_file = ""; }
        if (log_path === void 0) { log_path = "logs/"; }
        var _this_1 = _super.call(this) || this;
        var _this = _this_1;
        var lastAction;
        var lastData;
        var lastActionIdx = 0;
        if (replay) {
            _this_1.api = new ChampSelectReplay_1.ChampionSelectReplay(replay_file);
        }
        else {
            _this_1.api = new LCUApiWrapper_1.LCUApiWrapper();
        }
        var start = Date.now();
        var json_data = {
            "jsons": []
        };
        _this_1.api.subscribe("OnJsonApiEvent_lol-champ-select_v1_session", function (data) {
            json_data.jsons.push({
                "time": Date.now() - start,
                "data": data
            });
            if (data.eventType == "Delete") {
                if (replay == false) {
                    var now = Date.now();
                    var fs = require('fs');
                    var log_file = path.join(log_path, 'replay_' + now + '.json');
                    fs.writeFile(log_file, JSON.stringify(json_data), 'utf8', function (err) {
                        if (err)
                            throw err;
                        console.log('The replay file has been saved!');
                    });
                }
            }
            else {
                if (data.data.timer.phase == "GAME_STARTING") {
                    _this.emit('champSelectFinished');
                }
                var actions = data.data.actions;
                var latestActionIdx = actions.length - 1;
                var latestAction = actions[latestActionIdx][0];
                for (var i = actions.length - 1; i >= 0; i--) {
                    if (actions[i][0].isInProgress) {
                        latestAction = actions[i][0];
                        latestActionIdx = i;
                        break;
                    }
                }
                if (data.eventType == "Create") {
                    start = Date.now();
                    json_data.jsons[0].time = 0;
                    console.log("Champ select started");
                    _this.emit('championSelectStarted', data.data);
                    _this.emit('banTurnBegin', latestAction.pickTurn);
                    _this.emit('newTurnBegin', data.data.timer.adjustedTimeLeftInPhase / 1000);
                    for (var i = 0; i < data.data.myTeam.length; i++) {
                        _this.emit('summonerSpellChanged', i, 1, data.data.myTeam[i].spell1Id);
                        _this.emit('summonerSpellChanged', i, 2, data.data.myTeam[i].spell2Id);
                    }
                    for (var i = 0; i < data.data.theirTeam.length; i++) {
                        _this.emit('summonerSpellChanged', i + 5, 1, data.data.theirTeam[i].spell1Id);
                        _this.emit('summonerSpellChanged', i + 5, 2, data.data.theirTeam[i].spell2Id);
                    }
                }
                else if (data.eventType == "Update") {
                    var cdata = data.data;
                    _this.emit('newTurnBegin', cdata.timer.adjustedTimeLeftInPhase / 1000);
                    if (lastAction.id == latestAction.id) {
                        if (lastAction.championId != latestAction.championId) {
                            if (lastAction.type == "pick") {
                                _this.emit('championHoverChanged', latestAction.championId, latestAction.actorCellId);
                            }
                        }
                        if (latestAction.completed) {
                            if (latestAction.type == "pick") {
                                _this.emit('championLocked', latestAction.championId, latestAction.actorCellId);
                            }
                            else if (latestAction.type == "ban") {
                                var banTurn = latestAction.pickTurn;
                                if (latestActionIdx > 6)
                                    banTurn += 6;
                                _this.emit('championBanned', latestAction.championId, banTurn);
                            }
                            if (latestActionIdx == 19) {
                                _this.emit('phaseChanged', "finalStage");
                            }
                            for (var i = 0; i < cdata.myTeam.length; i++) {
                                if (cdata.myTeam[i].championId != lastData.myTeam[i].championId) {
                                    _this.emit('championChanged', cdata.myTeam[i].championId, cdata.myTeam[i].cellId);
                                }
                            }
                            for (var i = 0; i < cdata.theirTeam.length; i++) {
                                if (cdata.theirTeam[i].championId != lastData.theirTeam[i].championId) {
                                    _this.emit('championChanged', cdata.theirTeam[i].championId, cdata.theirTeam[i].cellId);
                                }
                            }
                        }
                    }
                    else {
                        if (latestActionIdx > 0 && actions[lastActionIdx][0].completed) {
                            if (lastAction.type == "pick") {
                                _this.emit('championLocked', actions[lastActionIdx][0].championId, actions[lastActionIdx][0].actorCellId);
                            }
                            else if (lastAction.type == "ban") {
                                var banTurn = actions[lastActionIdx][0].pickTurn;
                                if (latestActionIdx > 6)
                                    banTurn += 6;
                                _this.emit('championBanned', actions[lastActionIdx][0].championId, banTurn);
                            }
                        }
                        if (lastAction.isAllyAction != latestAction.isAllyAction) {
                            _this.emit('teamTurnChanged', latestAction.isAllyAction);
                        }
                        if (lastAction.type != latestAction.type) {
                            _this.emit('phaseChanged', latestAction.type);
                        }
                        if (latestAction.type == "pick") {
                            _this.emit('playerTurnBegin', latestAction.actorCellId);
                        }
                        else if (latestAction.type == "ban") {
                            var banTurn = latestAction.pickTurn;
                            if (latestActionIdx > 6)
                                banTurn += 6;
                            _this.emit('banTurnBegin', banTurn);
                        }
                        if (lastAction.type == "pick") {
                            _this.emit('playerTurnEnd', lastAction.actorCellId);
                        }
                        else if (lastAction.type == "ban") {
                            var banTurn = actions[lastActionIdx][0].pickTurn;
                            if (lastActionIdx > 6)
                                banTurn += 6;
                            _this.emit('banTurnEnd', banTurn);
                        }
                    }
                    for (var i = 0; i < cdata.myTeam.length; i++) {
                        if (cdata.myTeam[i].spell1Id != lastData.myTeam[i].spell1Id) {
                            _this.emit('summonerSpellChanged', i, 1, cdata.myTeam[i].spell1Id);
                        }
                        if (cdata.myTeam[i].spell2Id != lastData.myTeam[i].spell2Id) {
                            _this.emit('summonerSpellChanged', i, 2, cdata.myTeam[i].spell2Id);
                        }
                    }
                    for (var i = 0; i < cdata.theirTeam.length; i++) {
                        if (cdata.theirTeam[i].spell1Id != lastData.theirTeam[i].spell1Id) {
                            _this.emit('summonerSpellChanged', i + 5, 1, cdata.theirTeam[i].spell1Id);
                        }
                        if (cdata.theirTeam[i].spell2Id != lastData.theirTeam[i].spell2Id) {
                            _this.emit('summonerSpellChanged', i + 5, 2, cdata.theirTeam[i].spell2Id);
                        }
                    }
                }
                lastData = data.data;
                lastAction = latestAction;
                lastActionIdx = latestActionIdx;
            }
        });
        return _this_1;
    }
    ChampSelectApi.prototype.start = function () {
        this.api.start();
    };
    ChampSelectApi.prototype.request = function (uri, callback) {
        this.api.request(uri, callback);
    };
    return ChampSelectApi;
}(events_1["default"]));
exports.ChampSelectApi = ChampSelectApi;
//# sourceMappingURL=ChampSelectApi.js.map