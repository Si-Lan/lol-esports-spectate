/// <reference types="node" />
import EventEmitter from "events";
export default class ReconnectingWebSocket extends EventEmitter {
    /** web socket instance */
    private webSocket;
    /** is connection close manually by code. */
    private manualClosed;
    /** ws server url */
    private wsServerUrl;
    private wsProtocol;
    private wsOptions;
    private reconnectingInterval;
    constructor(url: string, protocol: string, options: {}, reconnectingInterval?: number);
    connect(): void;
    private onOpen;
    private onMessage;
    private onError;
    private onClose;
    private reconnect;
    send(data: any): void;
    close(): void;
    readyState(): 0 | 2 | 1 | 3;
}
