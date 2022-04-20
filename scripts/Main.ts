/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/babylon.gui.d.ts"/>

class Main {

    public canvas: HTMLCanvasElement;
    public engine: BABYLON.Engine;
    public scene: BABYLON.Scene;
	public camera: BABYLON.ArcRotateCamera;

    constructor(canvasElement: string) {
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
	}
	
	public async initialize(): Promise<void> {
		await this.initializeScene();

        let networkManager = new NetworkManager();
        networkManager.initialize();
	}

    public async initializeScene(): Promise<void> {
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor.copyFromFloats(158 / 255, 86 / 255, 55 / 255, 1);

		this.camera = new BABYLON.ArcRotateCamera("camera", - Math.PI / 4, Math.PI / 4, 20, BABYLON.Vector3.Zero(), this.scene);
		
		BABYLON.Engine.ShadersRepository = "./shaders/";

        let spaceship = new Spaceship("test-ship");
        spaceship.instantiate();
        spaceship.attachPilot(new FakeHuman());
        spaceship.attachController(new SpaceshipPhysic());
	}

    public animate(): void {
        this.engine.runRenderLoop(() => {
			this.scene.render();
        });

        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }
}

window.addEventListener("load", async () => {
	let main: Main = new Main("render-canvas");
	await main.initialize();
	main.animate();
})