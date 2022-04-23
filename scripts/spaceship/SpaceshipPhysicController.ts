/// <reference path="SpaceshipController.ts"/>

class SpaceshipPhysicController extends SpaceshipController {

    public onBeforeUpdateSpaceship(): void {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;
        this.spaceship.position.addInPlace(this.spaceship.forward.scale(this.spaceship.thrustInput * dt * this.spaceship.maxSpeed));

        let yawQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.up, this.spaceship.yawInput * dt * this.spaceship.yawSpeed);
        let rollQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.forward, - this.spaceship.rollInput * dt * this.spaceship.rollSpeed);
        let pitchQuat = BABYLON.Quaternion.RotationAxis(this.spaceship.right, - this.spaceship.pitchInput * dt * this.spaceship.pitchSpeed);

        yawQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        rollQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);
        pitchQuat.multiplyToRef(this.spaceship.rotationQuaternion, this.spaceship.rotationQuaternion);

        this.spaceship.aircraftModel.rotation.z = - Math.PI * 0.25 * this.spaceship.yawInput;
    }

    public onAfterUpdateSpaceship(): void {
        this.spaceship.main.networkManager.broadcastData(this.spaceship.getPositionData());
    }
}