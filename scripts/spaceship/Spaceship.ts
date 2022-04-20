class Spaceship extends BABYLON.Mesh {

    public rollInput: number = 0;
    public pitchInput: number = 0;

    constructor(name: string) {
        super(name);
    }

    public instantiate(): void {
        BABYLON.VertexData.CreateBox({ width: 1, height: 0.5, depth: 2 }).applyToMesh(this);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.getEngine().scenes[0].onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        let dt = this.getEngine().getDeltaTime() / 1000;
        this.position.addInPlace(this.forward.scale(dt * 3));

        let rollQuat = BABYLON.Quaternion.RotationAxis(this.forward, this.rollInput * dt * Math.PI);
        let pitchQuat = BABYLON.Quaternion.RotationAxis(this.right, this.pitchInput * dt * Math.PI);

        rollQuat.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
        pitchQuat.multiplyToRef(this.rotationQuaternion, this.rotationQuaternion);
    }
}