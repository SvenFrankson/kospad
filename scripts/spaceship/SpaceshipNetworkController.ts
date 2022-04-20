class SpaceshipNetworkController extends SpaceshipController {

    public lastSpaceshipPosition: ISpaceshipPositionData;

    public updateController(): void {
        this.spaceship.position.x = this.lastSpaceshipPosition.pos[0];
        this.spaceship.position.y = this.lastSpaceshipPosition.pos[1];
        this.spaceship.position.z = this.lastSpaceshipPosition.pos[2];

        this.spaceship.rotationQuaternion.x = this.lastSpaceshipPosition.quat[0];
        this.spaceship.rotationQuaternion.y = this.lastSpaceshipPosition.quat[1];
        this.spaceship.rotationQuaternion.z = this.lastSpaceshipPosition.quat[2];
        this.spaceship.rotationQuaternion.w = this.lastSpaceshipPosition.quat[3];
    }
}