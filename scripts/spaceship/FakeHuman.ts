/// <reference path="Pilot.ts"/>

class FakeHuman extends Pilot {
    
    public updatePilot(): void {
        this.spaceship.pitchInput = 1;
    }
}