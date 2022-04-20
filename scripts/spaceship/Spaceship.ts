class Spaceship extends BABYLON.Mesh {

    public pilot: Pilot;
    public controller: SpaceshipController;

    public rollInput: number = 0;
    public pitchInput: number = 0;

    constructor(name: string) {
        super(name);
    }
    
    public attachPilot(pilot: Pilot) {
        this.pilot = pilot;
        pilot.spaceship = this;
    }
    
    public attachController(controller: SpaceshipController) {
        this.controller = controller;
        controller.spaceship = this;
    }

    public instantiate(): void {
        BABYLON.VertexData.CreateBox({ width: 1, height: 0.5, depth: 2 }).applyToMesh(this);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.getEngine().scenes[0].onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        if (this.pilot) {
            this.pilot.updatePilot();
        }
        if (this.controller) {
            this.controller.updateController();
        }
    }
}