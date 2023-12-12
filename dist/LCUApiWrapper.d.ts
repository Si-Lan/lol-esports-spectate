/// <reference types="node" />
import { EventEmitter } from "events";
import { LCUApiInterface } from "./LCUApiInterface";
import ReconnectingWebSocket from "./internal/ReconnectingWebSocket";
import { LeagueClient } from "league-connect";
export declare class LCUApiWrapper extends EventEmitter implements LCUApiInterface {
    static instance: LCUApiWrapper;
    callbacks: Map<string, (data: any) => void>;
    user: string;
    authkey: string;
    password: string;
    port: number;
    ws: ReconnectingWebSocket;
    connected: boolean;
    credentials: any;
    client: LeagueClient;
    constructor();
    private connectWS;
    start(): void;
    subscribe(event: string, callback: (data: any) => void): void;
    request(uri: string, callback: (data: any) => void, errorCallback?: (error: Error) => any): void;
    static getInstance(): LCUApiWrapper;
    getConnectedStatus(): boolean;
}
