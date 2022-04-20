abstract class Pilot {

    public spaceship: Spaceship;

    constructor() {

    }

    public attachToSpaceship(spaceship: Spaceship) {
        this.spaceship = spaceship;
        spaceship.pilot = this;
    }

    public abstract updatePilot(): void;
}