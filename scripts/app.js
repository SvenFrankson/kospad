/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/babylon.gui.d.ts"/>
class Main {
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    }
    async initialize() {
        await this.initializeScene();
        let networkManager = new NetworkManager();
        networkManager.initialize();
    }
    async initializeScene() {
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor.copyFromFloats(158 / 255, 86 / 255, 55 / 255, 1);
        this.camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 4, Math.PI / 4, 20, BABYLON.Vector3.Zero(), this.scene);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        let spaceship = new Spaceship("test-ship");
        spaceship.instantiate();
        spaceship.attachPilot(new FakeHuman());
        spaceship.attachController(new SpaceshipPhysic());
    }
    animate() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}
window.addEventListener("load", async () => {
    let main = new Main("render-canvas");
    await main.initialize();
    main.animate();
});
/// <reference path="../lib/peerjs.d.ts"/>
class NetworkManager {
    constructor() {
        ScreenLoger.Log("Create NetworkManager");
    }
    initialize() {
        ScreenLoger.Log("Initialize NetworkManager");
        this.peer = new Peer();
        this.peer.on("open", this.onPeerOpen.bind(this));
        this.peer.on("connection", this.onPeerConnection.bind(this));
        this.otherIdInput = document.getElementById("other-id");
        this.otherIdConnect = document.getElementById("other-connect");
        this.otherIdConnect.onclick = this.onDebugOtherIdConnect.bind(this);
        this.textInput = document.getElementById("text-input");
        this.textSend = document.getElementById("text-send");
    }
    onPeerOpen(id) {
        ScreenLoger.Log("Open peer connection, my ID is");
        ScreenLoger.Log(id);
    }
    connectToPlayer(playerId) {
        ScreenLoger.Log("Connecting to player of ID'" + playerId + "'");
        let conn = this.peer.connect(playerId);
        conn.on("open", () => {
            this.onPeerConnection(conn);
        });
    }
    onPeerConnection(conn) {
        ScreenLoger.Log("Incoming connection, other ID is '" + conn.peer + "'");
        conn.on('data', (data) => {
            this.onConnData(data, conn);
        });
        this.textSend.onclick = () => {
            ScreenLoger.Log("Send " + this.textInput.value + " to other ID '" + conn.peer + "'");
            conn.send(this.textInput.value);
        };
    }
    onConnData(data, conn) {
        ScreenLoger.Log("Data received from other ID '" + conn.peer + "'");
        ScreenLoger.Log(data);
    }
    // debug
    onDebugOtherIdConnect() {
        let otherId = this.otherIdInput.value;
        this.connectToPlayer(otherId);
    }
}
class ScreenLoger {
    static get container() {
        if (!ScreenLoger._container) {
            ScreenLoger._container = document.createElement("div");
            ScreenLoger._container.id = "screen-loger-container";
            document.body.appendChild(ScreenLoger._container);
        }
        return ScreenLoger._container;
    }
    static Log(s) {
        let line = document.createElement("div");
        line.classList.add("screen-loger-line");
        line.innerText = s;
        ScreenLoger.container.appendChild(line);
    }
}
class Pilot {
    constructor() {
    }
    attachToSpaceship(spaceship) {
        this.spaceship = spaceship;
        spaceship.pilot = this;
    }
}
/// <reference path="Pilot.ts"/>
class FakeHuman extends Pilot {
    updatePilot() {
        this.spaceship.pitchInput = 1;
    }
}
class Spaceship extends BABYLON.Mesh {
    constructor(name) {
        super(name);
        this.rollInput = 0;
        this.pitchInput = 0;
        this._update = () => {
            if (this.pilot) {
                this.pilot.updatePilot();
            }
            if (this.controller) {
                this.controller.updateController();
            }
        };
    }
    attachPilot(pilot) {
        this.pilot = pilot;
        pilot.spaceship = this;
    }
    attachController(controller) {
        this.controller = controller;
        controller.spaceship = this;
    }
    instantiate() {
        BABYLON.VertexData.CreateBox({ width: 1, height: 0.5, depth: 2 }).applyToMesh(this);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.getEngine().scenes[0].onBeforeRenderObservable.add(this._update);
    }
}
class SpaceshipController {
    constructor() {
    }
    attachToSpaceship(spaceship) {
        this.spaceship = spaceship;
        spaceship.controller = this;
    }
}
/// <reference path="SpaceshipController.ts"/>
class SpaceshipPhysic extends SpaceshipController {
    updateController() {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;
        this.spaceship.position.addInPlace(this.spaceship.forward.scale(dt * 3));
        let rollQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.forward, this.spaceship.rollInput * dt * Math.PI);
        let pitchQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.right, this.spaceship.pitchInput * dt * Math.PI);
        rollQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        pitchQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
    }
}
