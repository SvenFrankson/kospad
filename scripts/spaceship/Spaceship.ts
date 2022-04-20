interface ISpaceshipPositionData {
    type: NetworkDataType,
    guid: string;
    pos: number[];
    quat: number[];
    vel: number[];
}

class Spaceship extends BABYLON.Mesh {

    public guid: string;

    public pilot: Pilot;
    public controller: SpaceshipController;

    public rollInput: number = 0;
    public pitchInput: number = 0;

    constructor(
        name: string,
        public main: Main
    ) {
        super(name);
        this.guid = "";
        for (let i = 0; i < 16; i++) {
            this.guid += (Math.floor(Math.random() * 16)).toString(16);
        }
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

    public getPositionData(): ISpaceshipPositionData {
        return {
            type: NetworkDataType.SpaceshipPosition,
            guid: this.guid,
            pos: [this.position.x, this.position.y, this.position.z],
            quat: [this.rotationQuaternion.x, this.rotationQuaternion.y, this.rotationQuaternion.z, this.rotationQuaternion.w],
            vel: [this.forward.x * 3, this.forward.y * 3, this.forward.z * 3]
        }
    }

    private _update = () => {
        if (this.pilot) {
            this.pilot.updatePilot();
        }
        if (this.controller) {
            this.controller.onBeforeUpdateSpaceship();
        }
        if (this.controller) {
            this.controller.onAfterUpdateSpaceship();
        }
    }
}