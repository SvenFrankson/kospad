/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/babylon.gui.d.ts"/>
class Main {
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    }
    async initialize() {
        await this.initializeScene();
        this.networkManager = new NetworkManager(this);
        this.networkManager.initialize();
        this.networkSpaceshipManager = new NetworkSpaceshipManager(this);
        this.networkSpaceshipManager.initialize();
        let spaceship = new Spaceship("test-ship", this);
        spaceship.instantiate();
        spaceship.attachController(new SpaceshipPhysicController());
        let pilot = new HumanPilot(this);
        pilot.initializeTouchScreen();
        pilot.initialize();
        let hud = new Hud(this);
        hud.initialize();
        pilot.attachHud(hud);
        spaceship.attachPilot(pilot);
    }
    async initializeScene() {
        this.scene = new BABYLON.Scene(this.engine);
        let light = new BABYLON.HemisphericLight("sun", BABYLON.Vector3.One(), this.scene);
        //this.camera = new BABYLON.ArcRotateCamera("camera", - Math.PI / 4, Math.PI / 4, 20, BABYLON.Vector3.Zero(), this.scene);
        //this.camera.attachControl(this.canvas);
        this.camera = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), this.scene);
        this.camera.rotationQuaternion = BABYLON.Quaternion.Identity();
        BABYLON.Engine.ShadersRepository = "./shaders/";
        let skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, this.scene);
        skybox.rotation.y = Math.PI / 2;
        skybox.infiniteDistance = true;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        let skyboxTexture = new BABYLON.CubeTexture("./assets/skyboxes/sky", this.scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture = skyboxTexture;
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;
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
/// <reference path="../../lib/peerjs.d.ts"/>
var NetworkDataType;
(function (NetworkDataType) {
    NetworkDataType[NetworkDataType["SpaceshipPosition"] = 1] = "SpaceshipPosition";
})(NetworkDataType || (NetworkDataType = {}));
class NetworkManager {
    constructor(main) {
        this.main = main;
        this.connections = [];
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
        this.connections.push(conn);
        conn.on('data', (data) => {
            this.onConnData(data, conn);
        });
        this.textSend.onclick = () => {
            ScreenLoger.Log("Send " + this.textInput.value + " to other ID '" + conn.peer + "'");
            conn.send(this.textInput.value);
        };
    }
    onConnData(data, conn) {
        if (data.type === NetworkDataType.SpaceshipPosition) {
            this.main.networkSpaceshipManager.updateData(data);
        }
        else {
            ScreenLoger.Log("Data received from other ID '" + conn.peer + "'");
            ScreenLoger.Log(data);
        }
    }
    broadcastData(data) {
        for (let i = 0; i < this.connections.length; i++) {
            this.connections[i].send(data);
        }
    }
    // debug
    onDebugOtherIdConnect() {
        let otherId = this.otherIdInput.value;
        this.connectToPlayer(otherId);
    }
}
class NetworkSpaceshipManager {
    constructor(main) {
        this.main = main;
        this.networkSpaceships = [];
    }
    initialize() {
    }
    createSpaceshipFromData(data) {
        let spaceship = new Spaceship("test-ship", this.main);
        spaceship.instantiate();
        spaceship.attachController(new SpaceshipNetworkController());
        spaceship.guid = data.guid;
        return spaceship;
    }
    updateData(data) {
        if (data) {
            let networkSpaceship = this.networkSpaceships.find(s => { return s.guid === data.guid; });
            if (!networkSpaceship) {
                networkSpaceship = this.createSpaceshipFromData(data);
                this.networkSpaceships.push(networkSpaceship);
            }
            if (networkSpaceship) {
                networkSpaceship.controller.lastSpaceshipPosition = data;
            }
        }
    }
}
class Pilot {
    constructor(main) {
        this.main = main;
    }
    attachToSpaceship(spaceship) {
        this.spaceship = spaceship;
        spaceship.pilot = this;
    }
}
/// <reference path="Pilot.ts"/>
class FakeHumanPilot extends Pilot {
    constructor() {
        super(...arguments);
        this._rollTimer = 0;
    }
    updatePilot() {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;
        this.spaceship.pitchInput = 1;
        this.spaceship.rollInput = 0;
        if (this._rollTimer < 0) {
            this._rollTimer = 2 + 4 * Math.random();
        }
        else if (this._rollTimer < 1) {
            this.spaceship.rollInput = 1;
        }
        this._rollTimer -= dt;
    }
}
/// <reference path="Pilot.ts"/>
class PlayerInput {
    constructor(pilot) {
        this.pilot = pilot;
        this.main = pilot.main;
    }
    connectInput() {
    }
}
class PlayerInputMouse extends PlayerInput {
    connectInput() {
        this.main.canvas.addEventListener("pointermove", (ev) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - this.pilot.hud.clientWidth * 0.5) / (this.pilot.hud.size * 0.5 * this.pilot.hud.outerCircleRadius / 500);
            let dy = -(y - this.pilot.hud.clientHeight * 0.5) / (this.pilot.hud.size * 0.5 * this.pilot.hud.outerCircleRadius / 500);
            this.pilot.spaceship.yawInput = Math.min(Math.max(-1, dx), 1);
            this.pilot.spaceship.pitchInput = Math.min(Math.max(-1, dy), 1);
        });
    }
}
class PlayerInputVirtualJoystick extends PlayerInput {
    constructor() {
        super(...arguments);
        this.clientWidth = 1;
        this.clientHeight = 1;
        this.size = 1;
        this.outerCircleRadius = 500;
    }
    connectInput() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 1000 1000");
        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.25;
        }
        else {
            this.size = this.clientWidth * 0.25;
        }
        svg.style.display = "block";
        svg.style.position = "fixed";
        svg.style.width = this.size.toFixed(0) + "px";
        svg.style.height = this.size.toFixed(0) + "px";
        svg.style.zIndex = "2";
        svg.style.right = "50px";
        svg.style.bottom = "50px";
        svg.style.pointerEvents = "none";
        document.body.appendChild(svg);
        let outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        outerCircle.setAttribute("cx", "500");
        outerCircle.setAttribute("cy", "500");
        outerCircle.setAttribute("r", this.outerCircleRadius.toFixed(0));
        outerCircle.setAttribute("fill", "none");
        outerCircle.setAttribute("stroke-width", "4");
        outerCircle.setAttribute("stroke", "white");
        svg.appendChild(outerCircle);
        this.reticle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.reticle.setAttribute("cx", "500");
        this.reticle.setAttribute("cy", "500");
        this.reticle.setAttribute("r", (this.outerCircleRadius * 0.5).toFixed(0));
        this.reticle.setAttribute("fill", "none");
        this.reticle.setAttribute("stroke-width", "4");
        this.reticle.setAttribute("stroke", "white");
        svg.appendChild(this.reticle);
        let centerX = this.clientWidth - this.size * 0.5 - 50;
        let centerY = this.clientHeight - this.size * 0.5 - 50;
        let pointerDown = false;
        this.main.canvas.addEventListener("pointerdown", (ev) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - centerX) / (this.size * 0.5);
            let dy = (y - centerY) / (this.size * 0.5);
            if (dx * dx + dy * dy < 1) {
                pointerDown = true;
                let cx = 500 + dx * 250;
                this.reticle.setAttribute("cx", cx.toFixed(1));
                let cy = 500 + dy * 250;
                this.reticle.setAttribute("cy", cy.toFixed(1));
                this.pilot.spaceship.yawInput = Math.min(Math.max(-1, dx), 1);
                this.pilot.spaceship.pitchInput = Math.min(Math.max(-1, dy), 1);
                this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
            }
        });
        this.main.canvas.addEventListener("pointermove", (ev) => {
            if (pointerDown) {
                let x = ev.clientX;
                let y = ev.clientY;
                let dx = (x - centerX) / (this.size * 0.5);
                let dy = (y - centerY) / (this.size * 0.5);
                if (dx * dx + dy * dy < 1) {
                    let cx = 500 + dx * 250;
                    this.reticle.setAttribute("cx", cx.toFixed(1));
                    let cy = 500 + dy * 250;
                    this.reticle.setAttribute("cy", cy.toFixed(1));
                    this.pilot.spaceship.yawInput = Math.min(Math.max(-1, dx), 1);
                    this.pilot.spaceship.pitchInput = Math.min(Math.max(-1, dy), 1);
                    this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                    this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
                }
                else if (dx * dx + dy * dy > 4) {
                    pointerDown = false;
                    let cx = 500 + dx * 250;
                    this.reticle.setAttribute("cx", cx.toFixed(1));
                    let cy = 500 + dy * 250;
                    this.reticle.setAttribute("cy", cy.toFixed(1));
                    this.pilot.spaceship.yawInput = 0;
                    this.pilot.spaceship.pitchInput = 0;
                    this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                    this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
                }
            }
        });
        this.main.canvas.addEventListener("pointerup", (ev) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - centerX) / (this.size * 0.5);
            let dy = (y - centerY) / (this.size * 0.5);
            if (dx * dx + dy * dy < 4) {
                pointerDown = false;
                this.reticle.setAttribute("cx", "500");
                this.reticle.setAttribute("cy", "500");
                this.pilot.spaceship.yawInput = 0;
                this.pilot.spaceship.pitchInput = 0;
                this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
            }
        });
    }
}
class HumanPilot extends Pilot {
    initialize() {
    }
    initializeDesktop() {
        let input = new PlayerInputMouse(this);
        input.connectInput();
    }
    initializeTouchScreen() {
        let input = new PlayerInputVirtualJoystick(this);
        input.connectInput();
    }
    attachHud(hud) {
        this.hud = hud;
    }
    updatePilot() {
        let camPos = this.spaceship.position.clone();
        camPos.addInPlace(this.spaceship.up.scale(2));
        camPos.addInPlace(this.spaceship.forward.scale(-10));
        this.main.camera.position.scaleInPlace(19).addInPlace(camPos).scaleInPlace(0.05);
        BABYLON.Quaternion.SlerpToRef(this.main.camera.rotationQuaternion, this.spaceship.rotationQuaternion, 0.05, this.main.camera.rotationQuaternion);
        this.hud.setXInput(this.spaceship.yawInput);
        this.hud.setYInput(this.spaceship.pitchInput);
    }
}
class Spaceship extends BABYLON.Mesh {
    constructor(name, main) {
        super(name);
        this.main = main;
        this.yawInput = 0;
        this.pitchInput = 0;
        this.rollInput = 0;
        this._update = () => {
            if (this.pilot) {
                this.pilot.updatePilot();
            }
            if (this.controller) {
                this.controller.onBeforeUpdateSpaceship();
            }
            if (this.controller) {
                this.controller.onAfterUpdateSpaceship();
            }
        };
        this.guid = "";
        for (let i = 0; i < 16; i++) {
            this.guid += (Math.floor(Math.random() * 16)).toString(16);
        }
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
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
        this.aircraftModel = new BABYLON.Mesh("aircraft-mesh");
        this.aircraftModel.parent = this;
        BABYLON.VertexData.CreateBox({ width: 1, height: 0.5, depth: 2 }).applyToMesh(this.aircraftModel);
        let material = new BABYLON.StandardMaterial("debug-white", this.main.scene);
        material.diffuseColor = BABYLON.Color3.FromHexString("#009987");
        material.specularColor.copyFromFloats(0, 0, 0);
        this.aircraftModel.material = material;
        this.getEngine().scenes[0].onBeforeRenderObservable.add(this._update);
    }
    getPositionData() {
        return {
            type: NetworkDataType.SpaceshipPosition,
            guid: this.guid,
            pos: [this.position.x, this.position.y, this.position.z],
            quat: [this.rotationQuaternion.x, this.rotationQuaternion.y, this.rotationQuaternion.z, this.rotationQuaternion.w],
            vel: [this.forward.x * 3, this.forward.y * 3, this.forward.z * 3]
        };
    }
}
class SpaceshipController {
    constructor() {
    }
    attachToSpaceship(spaceship) {
        this.spaceship = spaceship;
        spaceship.controller = this;
    }
    onBeforeUpdateSpaceship() { }
    onAfterUpdateSpaceship() { }
}
class SpaceshipNetworkController extends SpaceshipController {
    onBeforeUpdateSpaceship() {
        this.spaceship.position.x = this.lastSpaceshipPosition.pos[0];
        this.spaceship.position.y = this.lastSpaceshipPosition.pos[1];
        this.spaceship.position.z = this.lastSpaceshipPosition.pos[2];
        this.spaceship.rotationQuaternion.x = this.lastSpaceshipPosition.quat[0];
        this.spaceship.rotationQuaternion.y = this.lastSpaceshipPosition.quat[1];
        this.spaceship.rotationQuaternion.z = this.lastSpaceshipPosition.quat[2];
        this.spaceship.rotationQuaternion.w = this.lastSpaceshipPosition.quat[3];
    }
}
/// <reference path="SpaceshipController.ts"/>
class SpaceshipPhysicController extends SpaceshipController {
    onBeforeUpdateSpaceship() {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;
        this.spaceship.position.addInPlace(this.spaceship.forward.scale(dt * 3));
        let yawQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.up, this.spaceship.yawInput * dt * Math.PI * 0.5);
        let rollQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.forward, -this.spaceship.rollInput * dt * Math.PI * 0.5);
        let pitchQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.right, -this.spaceship.pitchInput * dt * Math.PI * 0.5);
        yawQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        rollQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        pitchQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        this.spaceship.aircraftModel.rotation.z = -Math.PI * 0.5 * this.spaceship.yawInput;
    }
    onAfterUpdateSpaceship() {
        this.spaceship.main.networkManager.broadcastData(this.spaceship.getPositionData());
    }
}
class Hud {
    constructor(main) {
        this.main = main;
        this.clientWidth = 1;
        this.clientHeight = 1;
        this.size = 1;
        this.outerCircleRadius = 400;
    }
    initialize() {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 1000 1000");
        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.7;
        }
        else {
            this.size = this.clientWidth * 0.7;
        }
        svg.style.display = "block";
        svg.style.position = "fixed";
        svg.style.width = this.size.toFixed(0) + "px";
        svg.style.height = this.size.toFixed(0) + "px";
        svg.style.zIndex = "2";
        svg.style.left = ((this.clientWidth - this.size) * 0.5).toFixed(0) + "px";
        svg.style.top = ((this.clientHeight - this.size) * 0.5).toFixed(0) + "px";
        svg.style.pointerEvents = "none";
        document.body.appendChild(svg);
        let outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        outerCircle.setAttribute("cx", "500");
        outerCircle.setAttribute("cy", "500");
        outerCircle.setAttribute("r", this.outerCircleRadius.toFixed(0));
        outerCircle.setAttribute("fill", "none");
        outerCircle.setAttribute("stroke-width", "4");
        outerCircle.setAttribute("stroke", "white");
        svg.appendChild(outerCircle);
        this.reticle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.reticle.setAttribute("cx", "500");
        this.reticle.setAttribute("cy", "500");
        this.reticle.setAttribute("r", "50");
        this.reticle.setAttribute("fill", "none");
        this.reticle.setAttribute("stroke-width", "4");
        this.reticle.setAttribute("stroke", "white");
        svg.appendChild(this.reticle);
    }
    setXInput(input) {
        input = Math.min(Math.max(input, -1), 1);
        let cx = 500 + input * this.outerCircleRadius;
        this.reticle.setAttribute("cx", cx.toFixed(1));
    }
    setYInput(input) {
        input = Math.min(Math.max(input, -1), 1);
        let cy = 500 - input * this.outerCircleRadius;
        this.reticle.setAttribute("cy", cy.toFixed(1));
    }
}
