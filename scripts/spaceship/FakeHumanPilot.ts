/// <reference path="Pilot.ts"/>
/// <reference path="HumanPilot.ts"/>

class FakeHumanPilot extends HumanPilot {
    
    private _rollTimer: number = 0;

    public updatePilot(): void {
        let dt = this.spaceship.getEngine().getDeltaTime() / 1000;

        this.spaceship.pitchInput = 1;

        this.spaceship.rollInput = 0;
        if (this._rollTimer < 0) {
            this._rollTimer = 2 + 4 * Math.random();
        }
        else if (this._rollTimer < 1) {
            this.spaceship.rollInput = 1;
        }
        this._rollTimer -= dt;
    }
}