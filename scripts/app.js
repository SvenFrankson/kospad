/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/babylon.gui.d.ts"/>
class Main {
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
    }
    async initialize() {
        await this.initializeScene();
        this.inputManager = new InputManager();
        this.inputManager.initialize();
        this.networkManager = new NetworkManager(this);
        this.networkManager.initialize();
        this.networkSpaceshipManager = new NetworkSpaceshipManager(this);
        this.networkSpaceshipManager.initialize();
        let spaceship = new Spaceship("test-ship", this);
        spaceship.instantiate();
        spaceship.attachController(new SpaceshipPhysicController());
        let pilot = new HumanPilot(this);
        pilot.initializeDesktop();
        pilot.initialize();
        let hud = new Hud(this);
        hud.initialize();
        hud.resize(0.8);
        pilot.attachHud(hud);
        spaceship.attachPilot(pilot);
        for (let i = 0; i < 100; i++) {
            let r = Math.random() * 5 + 1;
            let asteroid = BABYLON.MeshBuilder.CreateSphere("asteroid-" + i, { diameter: 2 * r }, this.scene);
            asteroid.position.x = Math.random() * 1000 - 500;
            asteroid.position.y = Math.random() * 200 - 100;
            asteroid.position.z = Math.random() * 1000 - 500;
            let up = BABYLON.MeshBuilder.CreateBox("up-" + i, { width: 1, depth: 1, height: 10 }, this.scene);
            up.position.copyFrom(asteroid.position);
            up.position.y += 5;
        }
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
class HumanPilot extends Pilot {
    initialize() {
    }
    initializeDesktop() {
        let mouse = new PlayerInputMouse(this);
        mouse.connectInput();
        let keyboard = new PlayerInputKeyboard(this);
        keyboard.connectInput();
    }
    initializeTouchScreen() {
        let input = new PlayerInputVirtualPad(this);
        input.connectInput();
    }
    attachHud(hud) {
        this.hud = hud;
        hud.pilot = this;
    }
    updatePilot() {
        let dt = this.main.engine.getDeltaTime() / 1000;
        let f = dt / 0.25;
        let camPos = this.spaceship.position.clone();
        camPos.addInPlace(this.spaceship.up.scale(2));
        camPos.addInPlace(this.spaceship.forward.scale(-8));
        this.main.camera.position.scaleInPlace(1 - f).addInPlace(camPos.scaleInPlace(f));
        BABYLON.Quaternion.SlerpToRef(this.main.camera.rotationQuaternion, this.spaceship.rotationQuaternion, f, this.main.camera.rotationQuaternion);
    }
}
/// <reference path="Pilot.ts"/>
/// <reference path="HumanPilot.ts"/>
class FakeHumanPilot extends HumanPilot {
    constructor() {
        super(...arguments);
        this._rollTimer = 0;
    }
    updatePilot() {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;
        this.spaceship.thrustInput = 0.5;
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
class Spaceship extends BABYLON.Mesh {
    constructor(name, main) {
        super(name);
        this.main = main;
        this.maxSpeed = 20;
        this.yawSpeed = Math.PI / 5;
        this.pitchSpeed = Math.PI / 5;
        this.rollSpeed = Math.PI / 5;
        this.yawInput = 0;
        this.pitchInput = 0;
        this.rollInput = 0;
        this.thrustInput = 0;
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
        this.spaceship.position.addInPlace(this.spaceship.forward.scale(Math.max(this.spaceship.thrustInput, 0) * dt * this.spaceship.maxSpeed));
        let yawQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.up, this.spaceship.yawInput * dt * this.spaceship.yawSpeed);
        let rollQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.forward, -this.spaceship.rollInput * dt * this.spaceship.rollSpeed);
        let pitchQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.right, -this.spaceship.pitchInput * dt * this.spaceship.pitchSpeed);
        yawQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        rollQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        pitchQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        this.spaceship.aircraftModel.rotation.z = -Math.PI * 0.25 * this.spaceship.yawInput;
    }
    onAfterUpdateSpaceship() {
        this.spaceship.main.networkManager.broadcastData(this.spaceship.getPositionData());
    }
}
class Hud {
    constructor(main) {
        this.main = main;
        this.initialized = false;
        this.clientWidth = 0;
        this.clientHeight = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.size = 0;
        this.reticleMaxRange = 0.65;
        this.svgPerPixel = 1;
        this.pitchGaugeValues = [];
        this.compassGaugeValues = [];
        this.strokeWidthLite = "2";
        this.strokeWidth = "4";
        this.strokeWidthHeavy = "6";
        this._update = () => {
            this.setReticlePos(this.pilot.spaceship.yawInput, this.pilot.spaceship.pitchInput);
            this.setTargetSpeed(this.pilot.spaceship.thrustInput);
            let pitch = Math.asin(this.pilot.spaceship.forward.y) / Math.PI * 180;
            let roll = -VMath.AngleFromToAround(BABYLON.Axis.Y, this.pilot.spaceship.up, this.pilot.spaceship.forward) / Math.PI * 180;
            if (Math.abs(roll) > 90) {
                if (pitch > 0) {
                    pitch = 180 - pitch;
                }
                else {
                    pitch = -180 - pitch;
                }
            }
            this.setPitchRoll(pitch, roll);
            let heading = VMath.AngleFromToAround(BABYLON.Axis.Z, this.pilot.spaceship.forward, BABYLON.Axis.Y, true) / Math.PI * 180;
            this.setHeading(heading);
        };
    }
    resize(sizeInPercent) {
        if (!this.initialized) {
            return;
        }
        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.size = Math.floor(Math.min(this.clientWidth, this.clientHeight) * sizeInPercent);
        this.centerX = this.clientWidth * 0.5;
        this.centerY = this.clientHeight * 0.5;
        this.svgPerPixel = 2000 / this.size;
        [this.root, this.reticleRoot].forEach(e => {
            e.setAttribute("width", this.size.toFixed(0));
            e.setAttribute("height", this.size.toFixed(0));
            e.style.position = "fixed";
            e.style.left = ((this.clientWidth - this.size) * 0.5).toFixed(1) + "px";
            e.style.top = ((this.clientHeight - this.size) * 0.5).toFixed(1) + "px";
            e.style.width = this.size.toFixed(1) + "px";
            e.style.height = this.size.toFixed(1) + "px";
        });
    }
    initialize() {
        this.root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.root.setAttribute("id", "hud-root");
        this.root.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.root.style.overflow = "visible";
        this.root.style.pointerEvents = "none";
        document.body.appendChild(this.root);
        let outterRing = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let outterRingD = SvgUtils.drawArc(30, 88, 770, true);
        outterRingD += SvgUtils.drawArc(92, 150, 770, true);
        outterRingD += SvgUtils.drawArc(30, 60, 800, true);
        outterRingD += SvgUtils.lineToPolar(60, 830);
        outterRingD += SvgUtils.drawArc(60, 120, 830);
        outterRingD += SvgUtils.lineToPolar(120, 800);
        outterRingD += SvgUtils.drawArc(120, 150, 800);
        outterRingD += SvgUtils.lineFromToPolar(88, 770, 89.5, 745);
        outterRingD += SvgUtils.drawArc(89.5, 90.5, 745, true);
        outterRingD += SvgUtils.lineToPolar(92, 770);
        outterRingD += SvgUtils.drawArc(210, 268, 770, true);
        outterRingD += SvgUtils.drawArc(272, 330, 770, true);
        outterRingD += SvgUtils.drawArc(210, 240, 800, true);
        outterRingD += SvgUtils.lineToPolar(240, 830);
        outterRingD += SvgUtils.drawArc(240, 300, 830);
        outterRingD += SvgUtils.lineToPolar(300, 800);
        outterRingD += SvgUtils.drawArc(300, 330, 800);
        outterRingD += SvgUtils.lineFromToPolar(268, 770, 269.5, 745);
        outterRingD += SvgUtils.drawArc(269.5, 270.5, 745, true);
        outterRingD += SvgUtils.lineToPolar(272, 770);
        outterRing.setAttribute("d", outterRingD);
        outterRing.setAttribute("fill", "none");
        outterRing.setAttribute("stroke", "white");
        outterRing.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(outterRing);
        this.rightGaugeForwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeForwardValueD = SvgUtils.drawArc(340, 30, 770, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(30, 860);
        rightGaugeForwardValueD += SvgUtils.drawArc(30, 340, 860, false, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
        this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
        this.rightGaugeForwardValue.setAttribute("fill", "rgba(255, 127, 0, 50%)");
        this.rightGaugeForwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeForwardValue);
        this.rightGaugeBackwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeBackwardValueD = SvgUtils.drawArc(330, 340, 770, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 860);
        rightGaugeBackwardValueD += SvgUtils.drawArc(340, 330, 860, false, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(330, 770);
        this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
        this.rightGaugeBackwardValue.setAttribute("fill", "rgba(0, 127, 255, 50%)");
        this.rightGaugeBackwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeBackwardValue);
        let rightGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeD = SvgUtils.drawArc(330, 30, 770, true);
        rightGaugeD += SvgUtils.lineToPolar(30, 860);
        rightGaugeD += SvgUtils.drawArc(30, 330, 860, false, true);
        rightGaugeD += SvgUtils.lineToPolar(330, 770);
        rightGaugeD += SvgUtils.lineFromToPolar(340, 770, 340, 860);
        rightGauge.setAttribute("d", rightGaugeD);
        rightGauge.setAttribute("fill", "none");
        rightGauge.setAttribute("stroke", "white");
        rightGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(rightGauge);
        let rightGaugeGraduations = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeGraduationsD = "";
        for (let i = 1; i < 12; i++) {
            let a = 330 + i * 5;
            rightGaugeGraduationsD += SvgUtils.lineFromToPolar(a, 830, a, 860);
        }
        rightGaugeGraduations.setAttribute("d", rightGaugeGraduationsD);
        rightGaugeGraduations.setAttribute("fill", "none");
        rightGaugeGraduations.setAttribute("stroke", "white");
        rightGaugeGraduations.setAttribute("stroke-width", this.strokeWidthLite);
        this.root.appendChild(rightGaugeGraduations);
        this.rightGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeCursorD = SvgUtils.drawArc(1, 359, 900, true, true);
        rightGaugeCursorD += SvgUtils.lineToPolar(0, 870);
        rightGaugeCursorD += SvgUtils.lineToPolar(1, 900);
        this.rightGaugeCursor.setAttribute("d", rightGaugeCursorD);
        this.rightGaugeCursor.setAttribute("fill", "white");
        this.rightGaugeCursor.setAttribute("fill-opacity", "50%");
        this.root.appendChild(this.rightGaugeCursor);
        let leftGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let leftGaugeD = SvgUtils.drawArc(150, 210, 770, true);
        leftGaugeD += SvgUtils.lineToPolar(210, 860);
        leftGaugeD += SvgUtils.drawArc(210, 150, 860, false, true);
        leftGaugeD += SvgUtils.lineToPolar(150, 770);
        leftGauge.setAttribute("d", leftGaugeD);
        leftGauge.setAttribute("fill", "none");
        leftGauge.setAttribute("stroke", "white");
        leftGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(leftGauge);
        this.reticleRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.reticleRoot.setAttribute("id", "hud-target-root");
        this.reticleRoot.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.reticleRoot.style.overflow = "visible";
        this.reticleRoot.style.pointerEvents = "none";
        document.body.appendChild(this.reticleRoot);
        /*
        let debugSquare2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        debugSquare2.setAttribute("x", "-1000");
        debugSquare2.setAttribute("y", "-1000");
        debugSquare2.setAttribute("width", "2000");
        debugSquare2.setAttribute("height", "2000");
        debugSquare2.setAttribute("fill", "rgba(255, 0, 255, 50%)");
        this.reticleRoot.appendChild(debugSquare2);
        */
        let reticle = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let reticleD = SvgUtils.drawArc(300, 60, 100, true) + SvgUtils.drawArc(120, 240, 100, true);
        reticle.setAttribute("d", reticleD);
        reticle.setAttribute("fill", "none");
        reticle.setAttribute("stroke", "white");
        reticle.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticle);
        let reticleArmLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmLeft.setAttribute("x1", "-20");
        reticleArmLeft.setAttribute("y1", "0");
        reticleArmLeft.setAttribute("x2", "-100");
        reticleArmLeft.setAttribute("y2", "0");
        reticleArmLeft.setAttribute("fill", "none");
        reticleArmLeft.setAttribute("stroke", "white");
        reticleArmLeft.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticleArmLeft);
        let reticleArmRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmRight.setAttribute("x1", "20");
        reticleArmRight.setAttribute("y1", "0");
        reticleArmRight.setAttribute("x2", "100");
        reticleArmRight.setAttribute("y2", "0");
        reticleArmRight.setAttribute("fill", "none");
        reticleArmRight.setAttribute("stroke", "white");
        reticleArmRight.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticleArmRight);
        let reticleArmBottom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmBottom.setAttribute("x1", "0");
        reticleArmBottom.setAttribute("y1", "20");
        reticleArmBottom.setAttribute("x2", "0");
        reticleArmBottom.setAttribute("y2", "100");
        reticleArmBottom.setAttribute("fill", "none");
        reticleArmBottom.setAttribute("stroke", "white");
        reticleArmBottom.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticleArmBottom);
        let pitchGaugeAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        pitchGaugeAxis.setAttribute("x1", "-500");
        pitchGaugeAxis.setAttribute("y1", "-550");
        pitchGaugeAxis.setAttribute("x2", "-500");
        pitchGaugeAxis.setAttribute("y2", "550");
        pitchGaugeAxis.setAttribute("fill", "none");
        pitchGaugeAxis.setAttribute("stroke", "white");
        pitchGaugeAxis.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(pitchGaugeAxis);
        this.pitchGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pitchGaugeCursor.setAttribute("fill", "none");
        this.pitchGaugeCursor.setAttribute("stroke", "white");
        this.pitchGaugeCursor.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(this.pitchGaugeCursor);
        for (let i = 0; i < 3; i++) {
            this.pitchGaugeValues[i] = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.pitchGaugeValues[i].setAttribute("fill", "white");
            this.pitchGaugeValues[i].setAttribute("text-anchor", "end");
            this.pitchGaugeValues[i].setAttribute("font-family", "Consolas");
            this.pitchGaugeValues[i].setAttribute("font-size", "40");
            this.root.appendChild(this.pitchGaugeValues[i]);
        }
        this.rollGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rollGaugeCursorD = SvgUtils.drawArc(250, 290, 740, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(290, 720);
        rollGaugeCursorD += SvgUtils.drawArc(290, 271, 720, false, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(271, 700);
        rollGaugeCursorD += SvgUtils.drawArc(271, 269, 700, false, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(269, 720);
        rollGaugeCursorD += SvgUtils.drawArc(269, 250, 720, false, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(250, 740);
        rollGaugeCursorD += SvgUtils.drawArc(87, 93, 710, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(90, 740);
        rollGaugeCursorD += SvgUtils.lineToPolar(87, 710);
        this.rollGaugeCursor.setAttribute("d", rollGaugeCursorD);
        this.rollGaugeCursor.setAttribute("fill", "white");
        this.rollGaugeCursor.setAttribute("fill-opacity", "50%");
        this.root.appendChild(this.rollGaugeCursor);
        this.compassGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.compassGaugeCursor.setAttribute("fill", "none");
        this.compassGaugeCursor.setAttribute("stroke", "white");
        this.compassGaugeCursor.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(this.compassGaugeCursor);
        for (let i = 0; i < 3; i++) {
            this.compassGaugeValues[i] = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.compassGaugeValues[i].setAttribute("fill", "white");
            this.compassGaugeValues[i].setAttribute("text-anchor", "middle");
            this.compassGaugeValues[i].setAttribute("font-family", "Consolas");
            this.compassGaugeValues[i].setAttribute("font-size", "40");
            this.root.appendChild(this.compassGaugeValues[i]);
        }
        this.main.scene.onBeforeRenderObservable.add(this._update);
        this.initialized = true;
    }
    attachPilot(pilot) {
        this.pilot = pilot;
        pilot.hud = this;
    }
    setReticlePos(x, y) {
        let dx = x * this.size * 0.5 * this.reticleMaxRange;
        let dy = y * this.size * 0.5 * this.reticleMaxRange;
        this.reticleRoot.style.left = ((this.clientWidth - this.size) * 0.5 + dx).toFixed(1) + "px";
        this.reticleRoot.style.top = ((this.clientHeight - this.size) * 0.5 - dy).toFixed(1) + "px";
        this.reticleRoot.style.clipPath = "circle(" + (this.size * 0.5 * this.reticleMaxRange + (100 + 4) / this.svgPerPixel).toFixed(0) + "px at " + (-dx + this.size * 0.5).toFixed(1) + "px " + (-dy + this.size * 0.5).toFixed(1) + "px)";
    }
    setTargetSpeed(s) {
        if (s > 0) {
            this.rightGaugeForwardValue.setAttribute("visibility", "visible");
            let a = 340 * (1 - s) + 390 * s;
            let rightGaugeForwardValueD = SvgUtils.drawArc(340, a, 770, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(a, 860);
            rightGaugeForwardValueD += SvgUtils.drawArc(a, 340, 860, false, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
            this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeForwardValue.setAttribute("visibility", "hidden");
        }
        if (s < 0) {
            this.rightGaugeBackwardValue.setAttribute("visibility", "visible");
            s = -s;
            let a = 340 * (1 - s) + 330 * s;
            let rightGaugeBackwardValueD = SvgUtils.drawArc(a, 340, 770, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 860);
            rightGaugeBackwardValueD += SvgUtils.drawArc(340, a, 860, false, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(a, 770);
            this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeBackwardValue.setAttribute("visibility", "hidden");
        }
        if (s === 0) {
            this.rightGaugeCursor.setAttribute("transform", "rotate(-340 0 0)");
        }
    }
    setPitchRoll(p, r) {
        let n = 0;
        let d = "";
        for (let i = -18; i <= 18; i++) {
            let y = (i * 10 + p) * 40;
            if (Math.abs(y) < 550) {
                d += "M -500 " + y.toFixed(0) + " L -480 " + y.toFixed(0) + " ";
                let textSVG = this.pitchGaugeValues[n];
                if (textSVG) {
                    textSVG.innerHTML = (-i * 10).toFixed(0).padStart(4, "");
                    textSVG.setAttribute("x", "-520");
                    textSVG.setAttribute("y", (y + 10).toFixed(1));
                    let v = 1 - (Math.abs(y) - 275) / 275;
                    v = Math.min(1, v);
                    let vRoll = Math.abs(Math.abs(r) - 90) / 10;
                    vRoll = Math.min(1, vRoll);
                    textSVG.setAttribute("fill-opacity", (v * vRoll * 100).toFixed(0) + "%");
                    n++;
                }
            }
        }
        for (let i = n; i < 3; i++) {
            let textSVG = this.pitchGaugeValues[n];
            textSVG.setAttribute("fill-opacity", "0%");
        }
        this.pitchGaugeCursor.setAttribute("d", d);
        this.rollGaugeCursor.setAttribute("transform", "rotate(" + (-r).toFixed(1) + " 0 0)");
    }
    setHeading(h) {
        let n = 0;
        let d = "";
        for (let i = 0; i < 72; i++) {
            let a = i * 5 + h;
            if (a > 360) {
                a = a - 360;
            }
            if (a > 242 && a < 298) {
                if (i % 4 === 0) {
                    let textSVG = this.compassGaugeValues[n];
                    if (textSVG) {
                        textSVG.innerHTML = (i * 5 / 10).toFixed(0);
                        textSVG.setAttribute("x", "0");
                        textSVG.setAttribute("y", "810");
                        textSVG.setAttribute("transform", "rotate(" + (-(a - 270)).toFixed(1) + " 0 0)");
                        let v = (1 - Math.abs(270 - a) / 28) * 2;
                        v = Math.min(1, v);
                        textSVG.setAttribute("fill-opacity", (v * 100).toFixed(0) + "%");
                        n++;
                    }
                }
                else {
                    d += SvgUtils.lineFromToPolar(a, 790, a, 810);
                }
            }
        }
        for (let i = n; i < 3; i++) {
            let textSVG = this.compassGaugeValues[n];
            textSVG.setAttribute("fill-opacity", "0%");
        }
        this.compassGaugeCursor.setAttribute("d", d);
    }
}
var KeyInput;
(function (KeyInput) {
    KeyInput[KeyInput["NULL"] = -1] = "NULL";
    KeyInput[KeyInput["THRUST_INC"] = 0] = "THRUST_INC";
    KeyInput[KeyInput["THRUST_DEC"] = 1] = "THRUST_DEC";
    KeyInput[KeyInput["ROLL_LEFT"] = 2] = "ROLL_LEFT";
    KeyInput[KeyInput["ROLL_RIGHT"] = 3] = "ROLL_RIGHT";
})(KeyInput || (KeyInput = {}));
class InputManager {
    constructor() {
        this.keyInputMap = new Map();
        this.keyInputDown = new UniqueList();
        this.keyDownListeners = [];
        this.mappedKeyDownListeners = new Map();
        this.keyUpListeners = [];
        this.mappedKeyUpListeners = new Map();
    }
    initialize() {
        this.keyInputMap.set("KeyW", KeyInput.THRUST_INC);
        this.keyInputMap.set("KeyA", KeyInput.ROLL_LEFT);
        this.keyInputMap.set("KeyS", KeyInput.THRUST_DEC);
        this.keyInputMap.set("KeyD", KeyInput.ROLL_RIGHT);
        window.addEventListener("keydown", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.push(keyInput);
                for (let i = 0; i < this.keyDownListeners.length; i++) {
                    this.keyDownListeners[i](keyInput);
                }
                let listeners = this.mappedKeyDownListeners.get(keyInput);
                if (listeners) {
                    for (let i = 0; i < listeners.length; i++) {
                        listeners[i]();
                    }
                }
            }
        });
        window.addEventListener("keyup", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.remove(keyInput);
                for (let i = 0; i < this.keyUpListeners.length; i++) {
                    this.keyUpListeners[i](keyInput);
                }
                let listeners = this.mappedKeyUpListeners.get(keyInput);
                if (listeners) {
                    for (let i = 0; i < listeners.length; i++) {
                        listeners[i]();
                    }
                }
            }
        });
    }
    addKeyDownListener(callback) {
        this.keyDownListeners.push(callback);
    }
    addMappedKeyDownListener(k, callback) {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyDownListeners.set(k, listeners);
        }
    }
    removeKeyDownListener(callback) {
        let i = this.keyDownListeners.indexOf(callback);
        if (i != -1) {
            this.keyDownListeners.splice(i, 1);
        }
    }
    removeMappedKeyDownListener(k, callback) {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }
    addKeyUpListener(callback) {
        this.keyUpListeners.push(callback);
    }
    addMappedKeyUpListener(k, callback) {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyUpListeners.set(k, listeners);
        }
    }
    removeKeyUpListener(callback) {
        let i = this.keyUpListeners.indexOf(callback);
        if (i != -1) {
            this.keyUpListeners.splice(i, 1);
        }
    }
    removeMappedKeyUpListener(k, callback) {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }
    isKeyInputDown(keyInput) {
        return this.keyInputDown.contains(keyInput);
    }
}
class PlayerInput {
    constructor(pilot) {
        this.pilot = pilot;
        this.main = pilot.main;
    }
    connectInput() {
    }
}
/// <reference path="PlayerInput.ts"/>
class PlayerInputKeyboard extends PlayerInput {
    constructor() {
        super(...arguments);
        this._thrustInput = 0;
        this._update = () => {
            let dt = this.main.engine.getDeltaTime() / 1000;
            if (this.main.inputManager.isKeyInputDown(KeyInput.THRUST_INC)) {
                this._thrustInput += dt;
            }
            else if (this.main.inputManager.isKeyInputDown(KeyInput.THRUST_DEC)) {
                this._thrustInput -= dt;
            }
            else if (this._thrustInput < 0) {
                if (Math.abs(this._thrustInput) > 0.001) {
                    this._thrustInput = this._thrustInput * (1 - dt);
                }
                else {
                    this._thrustInput = 0;
                }
            }
            this._thrustInput = Math.min(Math.max(this._thrustInput, -1), 1);
            this.pilot.spaceship.thrustInput = this._thrustInput;
            this.pilot.spaceship.rollInput = 0;
            if (this.main.inputManager.isKeyInputDown(KeyInput.ROLL_LEFT)) {
                this.pilot.spaceship.rollInput = -1;
            }
            else if (this.main.inputManager.isKeyInputDown(KeyInput.ROLL_RIGHT)) {
                this.pilot.spaceship.rollInput = 1;
            }
        };
    }
    connectInput() {
        this.main.scene.onBeforeRenderObservable.add(this._update);
    }
}
/// <reference path="PlayerInput.ts"/>
class PlayerInputMouse extends PlayerInput {
    connectInput() {
        this.main.canvas.addEventListener("pointermove", (ev) => {
            let dx = (ev.clientX - this.pilot.hud.centerX) / (this.pilot.hud.size * 0.5 * this.pilot.hud.reticleMaxRange);
            let dy = -(ev.clientY - this.pilot.hud.centerY) / (this.pilot.hud.size * 0.5 * this.pilot.hud.reticleMaxRange);
            if (dx * dx + dy * dy > 1) {
                let l = Math.sqrt(dx * dx + dy * dy);
                dx = dx / l;
                dy = dy / l;
            }
            this.pilot.spaceship.yawInput = Math.min(Math.max(-1, dx), 1);
            this.pilot.spaceship.pitchInput = Math.min(Math.max(-1, dy), 1);
        });
    }
}
/// <reference path="PlayerInput.ts"/>
class PlayerInputVirtualPad extends PlayerInput {
    constructor() {
        super(...arguments);
        this.clientWidth = 100;
        this.clientHeight = 100;
        this.size = 10;
        this.marginLeft = 10;
        this.marginBottom = 10;
        this.centerX = 20;
        this.centerY = 20;
        this._pointerDown = false;
        this._dx = 0;
        this._dy = 0;
        this._update = () => {
            if (!this._pointerDown) {
                if (Math.abs(this._dx) > 0.001 || Math.abs(this._dy) > 0.001) {
                    this._dx *= 0.9;
                    this._dy *= 0.9;
                    if (Math.abs(this._dx) > 0.001 || Math.abs(this._dy) > 0.001) {
                        this.updatePad(this._dx, this._dy);
                        this.updatePilot(this._dx, this._dy);
                    }
                    else {
                        this.updatePad(0, 0);
                        this.updatePilot(0, 0);
                    }
                }
            }
        };
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
        let margin = Math.min(50, this.size * 0.3);
        svg.style.display = "block";
        svg.style.position = "fixed";
        svg.style.width = this.size.toFixed(0) + "px";
        svg.style.height = this.size.toFixed(0) + "px";
        svg.style.zIndex = "2";
        svg.style.right = margin.toFixed(0) + "px";
        svg.style.bottom = margin.toFixed(0) + "px";
        svg.style.overflow = "visible";
        svg.style.pointerEvents = "none";
        document.body.appendChild(svg);
        let base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        base.setAttribute("cx", "500");
        base.setAttribute("cy", "500");
        base.setAttribute("r", "500");
        base.setAttribute("fill", "white");
        base.setAttribute("fill-opacity", "10%");
        base.setAttribute("stroke-width", "4");
        base.setAttribute("stroke", "white");
        svg.appendChild(base);
        this.pad = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.pad.setAttribute("cx", "500");
        this.pad.setAttribute("cy", "500");
        this.pad.setAttribute("r", "250");
        this.pad.setAttribute("fill", "white");
        this.pad.setAttribute("fill-opacity", "50%");
        this.pad.setAttribute("stroke-width", "4");
        this.pad.setAttribute("stroke", "white");
        svg.appendChild(this.pad);
        this.centerX = this.clientWidth - this.size * 0.5 - margin;
        this.centerY = this.clientHeight - this.size * 0.5 - margin;
        this.main.canvas.addEventListener("pointerdown", (ev) => {
            let dx = this.clientXToDX(ev.clientX);
            let dy = this.clientYToDY(ev.clientY);
            if (dx * dx + dy * dy < 1) {
                this._pointerDown = true;
                this._dx = dx;
                this._dy = dy;
                this.updatePad(this._dx, this._dy);
                this.updatePilot(this._dx, this._dy);
            }
        });
        this.main.canvas.addEventListener("pointermove", (ev) => {
            if (this._pointerDown) {
                let dx = this.clientXToDX(ev.clientX);
                let dy = this.clientYToDY(ev.clientY);
                if (dx * dx + dy * dy < 1) {
                    this._dx = dx;
                    this._dy = dy;
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
                else if (dx * dx + dy * dy < 4) {
                    let l = Math.sqrt(dx * dx + dy * dy);
                    this._dx = dx / l;
                    this._dy = dy / l;
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
            }
        });
        this.main.canvas.addEventListener("pointerup", (ev) => {
            this._pointerDown = false;
        });
        this.main.scene.onBeforeRenderObservable.add(this._update);
    }
    clientXToDX(clientX) {
        return (clientX - this.centerX) / (this.size * 0.5);
    }
    clientYToDY(clientY) {
        return (clientY - this.centerY) / (this.size * 0.5);
    }
    updatePad(dx, dy) {
        let cx = 500 + dx * 250;
        this.pad.setAttribute("cx", cx.toFixed(1));
        let cy = 500 + dy * 250;
        this.pad.setAttribute("cy", cy.toFixed(1));
    }
    updatePilot(dx, dy) {
        this.pilot.spaceship.yawInput = Math.min(Math.max(-1, dx), 1);
        this.pilot.spaceship.pitchInput = Math.min(Math.max(-1, dy), 1);
    }
}
class SvgUtils {
    static lineFromToPolar(a1, r1, a2, r2) {
        a1 *= Math.PI / 180;
        a2 *= Math.PI / 180;
        let x1 = (Math.cos(a1) * r1).toFixed(0);
        let y1 = (-Math.sin(a1) * r1).toFixed(0);
        let x2 = (Math.cos(a2) * r2).toFixed(0);
        let y2 = (-Math.sin(a2) * r2).toFixed(0);
        return "M " + x1 + " " + y1 + " L " + x2 + " " + y2 + " ";
    }
    static lineToPolar(a, r) {
        a *= Math.PI / 180;
        let x = (Math.cos(a) * r).toFixed(0);
        let y = (-Math.sin(a) * r).toFixed(0);
        return "L " + x + " " + y + " ";
    }
    static drawArc(fromA, toA, r, insertFirstPoint = true, clockwise = false) {
        fromA *= Math.PI / 180;
        toA *= Math.PI / 180;
        while (fromA < 0) {
            fromA += 2 * Math.PI;
        }
        while (fromA >= 2 * Math.PI) {
            fromA -= 2 * Math.PI;
        }
        while (toA < 0) {
            toA += 2 * Math.PI;
        }
        while (toA >= 2 * Math.PI) {
            toA -= 2 * Math.PI;
        }
        let largeCircle = "0";
        if (!clockwise) {
            if (toA > fromA) {
                if (toA - fromA > Math.PI) {
                    largeCircle = "1";
                }
            }
            else if (toA < fromA) {
                if (fromA - toA < Math.PI) {
                    largeCircle = "1";
                }
            }
        }
        let x0 = (Math.cos(fromA) * r).toFixed(0);
        let y0 = (-Math.sin(fromA) * r).toFixed(0);
        let x1 = (Math.cos(toA) * r).toFixed(0);
        let y1 = (-Math.sin(toA) * r).toFixed(0);
        let arc = "";
        if (insertFirstPoint) {
            arc += "M " + x0 + " " + y0 + " ";
        }
        arc += "A " + r.toFixed(0) + " " + r.toFixed(0) + " 0 " + largeCircle + " " + (clockwise ? "1" : "0") + " " + x1 + " " + y1 + " ";
        return arc;
    }
}
class UniqueList {
    constructor() {
        this._elements = [];
    }
    get length() {
        return this._elements.length;
    }
    get(i) {
        return this._elements[i];
    }
    getLast() {
        return this.get(this.length - 1);
    }
    push(e) {
        if (this._elements.indexOf(e) === -1) {
            this._elements.push(e);
        }
    }
    remove(e) {
        let i = this._elements.indexOf(e);
        if (i != -1) {
            this._elements.splice(i, 1);
        }
    }
    contains(e) {
        return this._elements.indexOf(e) != -1;
    }
}
class VMath {
    // Method adapted from gre's work (https://github.com/gre/bezier-easing). Thanks !
    static easeOutElastic(t, b = 0, c = 1, d = 1) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * .3;
        }
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    }
    static easeInOutCirc(x) {
        return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }
    static easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }
    static easeOutQuart(x) {
        return 1 - Math.pow(1 - x, 4);
    }
    static ProjectPerpendicularAt(v, at) {
        let p = BABYLON.Vector3.Zero();
        let k = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    }
    static Angle(from, to) {
        let pFrom = BABYLON.Vector3.Normalize(from);
        let pTo = BABYLON.Vector3.Normalize(to);
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }
    static AngleFromToAround(from, to, around, keepPositive) {
        let pFrom = VMath.ProjectPerpendicularAt(from, around).normalize();
        let pTo = VMath.ProjectPerpendicularAt(to, around).normalize();
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
            if (keepPositive) {
                angle += 2 * Math.PI;
            }
        }
        return angle;
    }
    static StepAngle(from, to, step) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(from - to) <= step) {
            return to;
        }
        if (to < from) {
            step *= -1;
        }
        if (Math.abs(from - to) > Math.PI) {
            step *= -1;
        }
        return from + step;
    }
    static LerpAngle(from, to, t) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(from - to) > Math.PI) {
            if (from > Math.PI) {
                from -= 2 * Math.PI;
            }
            else {
                to -= 2 * Math.PI;
            }
        }
        return from * (1 - t) + to * t;
    }
    static AngularDistance(from, to) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        let d = Math.abs(from - to);
        if (d > Math.PI) {
            d *= -1;
        }
        if (to < from) {
            d *= -1;
        }
        return d;
    }
    static CatmullRomPath(path) {
        let interpolatedPoints = [];
        for (let i = 0; i < path.length; i++) {
            let p0 = path[(i - 1 + path.length) % path.length];
            let p1 = path[i];
            let p2 = path[(i + 1) % path.length];
            let p3 = path[(i + 2) % path.length];
            interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
        }
        for (let i = 0; i < interpolatedPoints.length; i++) {
            path.splice(2 * i + 1, 0, interpolatedPoints[i]);
        }
    }
    static SetABDistance(a, b, dist) {
        let n = b.subtract(a);
        n.normalize().scaleInPlace(dist);
        return a.add(n);
    }
    static SetABDistanceInPlace(a, b, dist, keepAInPlace) {
        let n = b.subtract(a);
        let l = n.length();
        n.normalize();
        if (keepAInPlace) {
            b.copyFrom(n).scaleInPlace(dist).addInPlace(a);
        }
        else {
            let d = (l - dist) * 0.5;
            n.scaleInPlace(d);
            a.addInPlace(n);
            b.subtractInPlace(n);
        }
    }
}
