/// <reference path="SpaceshipController.ts"/>

class SpaceshipPhysic extends SpaceshipController {

    public updateController(): void {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;
        this.spaceship.position.addInPlace(this.spaceship.forward.scale(dt * 3));

        let rollQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.forward, this.spaceship.rollInput * dt * Math.PI);
        let pitchQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.right, this.spaceship.pitchInput * dt * Math.PI);

        rollQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        pitchQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
    }
}