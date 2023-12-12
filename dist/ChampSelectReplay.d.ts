/// <reference types="node" />
import EventEmitter from "events";
import { LCUApiInterface } from "./LCUApiInterface";
export declare class ChampionSelectReplay extends EventEmitter implements LCUApiInterface {
    replay: any;
    callbacks: Map<string, (data: any) => void>;
    constructor(replay_file: any);
    request(uri: string, callback: (data: any) => void): void;
    start(): void;
    subscribe(event: string, callback: (data: any) => void): void;
    getConnectedStatus(): boolean;
}
