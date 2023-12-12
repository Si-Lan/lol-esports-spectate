/// <reference types="node" />
import EventEmitter from "events";
import { LCUApiInterface } from "./LCUApiInterface";
export declare class ChampSelectApi extends EventEmitter {
    api: LCUApiInterface;
    constructor(replay?: boolean, replay_file?: string, log_path?: string);
    start(): void;
    request(uri: any, callback: any): void;
}
