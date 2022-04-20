/// <reference path="../../lib/peerjs.d.ts"/>

enum NetworkDataType {
    SpaceshipPosition = 1
}

class NetworkManager {

    private peer: Peer;

    private connections: Peer.DataConnection[] = [];

    // debug
    private otherIdInput: HTMLInputElement;
    private otherIdConnect: HTMLInputElement;
    private textInput: HTMLInputElement;
    private textSend: HTMLInputElement;

    constructor(
        public main: Main,
    ) {
        ScreenLoger.Log("Create NetworkManager");
    }

    public initialize(): void {
        ScreenLoger.Log("Initialize NetworkManager");
        this.peer = new Peer();
        this.peer.on("open", this.onPeerOpen.bind(this));
        this.peer.on("connection", this.onPeerConnection.bind(this))
        
        this.otherIdInput = document.getElementById("other-id") as HTMLInputElement;
        this.otherIdConnect = document.getElementById("other-connect") as HTMLInputElement;

        this.otherIdConnect.onclick = this.onDebugOtherIdConnect.bind(this);
        
        this.textInput = document.getElementById("text-input") as HTMLInputElement;
        this.textSend = document.getElementById("text-send") as HTMLInputElement;
    }

    public onPeerOpen(id: string): void {
        ScreenLoger.Log("Open peer connection, my ID is");
        ScreenLoger.Log(id);
    }

    public connectToPlayer(playerId: string): void {
        ScreenLoger.Log("Connecting to player of ID'" + playerId + "'");
        let conn = this.peer.connect(playerId);
        conn.on("open", () => {
            this.onPeerConnection(conn);
        });
    }

    public onPeerConnection(conn: Peer.DataConnection): void {
        ScreenLoger.Log("Incoming connection, other ID is '" + conn.peer + "'");
        this.connections.push(conn);

        conn.on(
            'data',
            (data) => {
                this.onConnData(data, conn);
            }
        );

        this.textSend.onclick = () => {
            ScreenLoger.Log("Send " + this.textInput.value + " to other ID '" + conn.peer + "'");
            conn.send(this.textInput.value);
        }
    }

    public onConnData(data: any, conn: Peer.DataConnection): void {
        if (data.type === NetworkDataType.SpaceshipPosition) {
            this.main.networkSpaceshipManager.updateData(data);
        }
        else {
            ScreenLoger.Log("Data received from other ID '" + conn.peer + "'");
            ScreenLoger.Log(data);
        }
    }

    public broadcastData(data: any): void {
        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].send(data);
        }
    }

    // debug
    public onDebugOtherIdConnect(): void {
        let otherId = this.otherIdInput.value;
        this.connectToPlayer(otherId);
    }
}