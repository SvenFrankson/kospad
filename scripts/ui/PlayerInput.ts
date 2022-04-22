class PlayerInput {

    public main: Main;

    constructor(
        public pilot: HumanPilot
    ) {
        this.main = pilot.main;
    }

    public connectInput(): void {

    }
}