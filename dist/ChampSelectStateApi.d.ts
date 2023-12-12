import { State } from "./Interfaces";
import { EventData } from "./internal/ExternalInterfaces";
import { LCUApiInterface } from "./LCUApiInterface";
import { TypedEmitter } from 'tiny-typed-emitter';
export declare interface ChampSelectApi {
    on(event: "championSelectEnd"): void;
    on(event: "championSelectStarted"): void;
    on(event: "newState", state: State): void;
    on(event: "newPickOrder", pickOrderState: State): void;
    on(event: string): any;
}
interface ChampSelectStateApiEvents {
    'championSelectEnd': () => void;
    'championSelectStarted': () => void;
    'newState': (state: State) => void;
    'newPickOrder': (pickOrder: State) => void;
}
export interface ChampSelectStateApiOptions {
    recordReplays?: boolean;
    replayFolder?: string;
}
export declare class ChampSelectStateApi extends TypedEmitter<ChampSelectStateApiEvents> {
    summonerNameMap: Map<number, string | any>;
    pickOrderState: State;
    replay: boolean;
    jsonData: {
        jsons: [{
            time: number;
            data: EventData;
        }?];
        summonerNameMap?: any;
    };
    start: number;
    leagueApi: LCUApiInterface;
    getSummonersRequestIntervall: any;
    options: ChampSelectStateApiOptions;
    constructor(replay?: boolean, replay_file?: string, options?: ChampSelectStateApiOptions);
    stop(): void;
    champSelectEventCallback(eventData: EventData): void;
    autoConvertMapToObject: (map: any) => {};
    lastState: State;
    parseData(eventData: EventData): State;
    getConnectionStatus(): "Not connected" | "Replay" | "Connected";
}
export {};
