class NetworkSpaceshipManager {
    
    public networkSpaceships: Spaceship[] = [];

    constructor(
        public main: Main
    ) {

    }

    public initialize(): void {

    }

    public createSpaceshipFromData(data: ISpaceshipPositionData): Spaceship {
        let spaceship = new Spaceship("test-ship", this.main);
        spaceship.instantiate();
        spaceship.attachController(new SpaceshipNetworkController());
        spaceship.guid = data.guid;
        return spaceship;
    }

    public updateData(data: ISpaceshipPositionData): void {
        if (data) {
            let networkSpaceship = this.networkSpaceships.find(s => { return s.guid === data.guid });
            if (!networkSpaceship) {
                networkSpaceship = this.createSpaceshipFromData(data);
                this.networkSpaceships.push(networkSpaceship);
            }
            if (networkSpaceship) {
                (networkSpaceship.controller as SpaceshipNetworkController).lastSpaceshipPosition = data;
            }
        }
    }
}