abstract class Pilot {

    public spaceship: Spaceship;

    constructor(
        public main: Main
    ) {

    }

    public attachToSpaceship(spaceship: Spaceship) {
        this.spaceship = spaceship;
        spaceship.pilot = this;
    }

    public abstract updatePilot(): void;
}