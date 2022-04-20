abstract class SpaceshipController {

    public spaceship: Spaceship;

    constructor() {

    }

    public attachToSpaceship(spaceship: Spaceship) {
        this.spaceship = spaceship;
        spaceship.controller = this;
    }

    public abstract updateController(): void;
}