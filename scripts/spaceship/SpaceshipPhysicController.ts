/// <reference path="SpaceshipController.ts"/>

class SpaceshipPhysicController extends SpaceshipController {

    public onBeforeUpdateSpaceship(): void {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;
        this.spaceship.position.addInPlace(this.spaceship.forward.scale(dt * 3));

        let rollQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.forward, - this.spaceship.rollInput * dt * Math.PI * 0.5);
        let pitchQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.right, - this.spaceship.pitchInput * dt * Math.PI * 0.5);

        rollQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        pitchQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
    }

    public onAfterUpdateSpaceship(): void {
        this.spaceship.main.networkManager.broadcastData(this.spaceship.getPositionData());
    }
}