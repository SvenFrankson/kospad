/// <reference path="PlayerInput.ts"/>

class PlayerInputKeyboard extends PlayerInput {

    private _thrustInput: number = 0;

    public connectInput(): void {
        this.main.scene.onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        let dt = this.main.engine.getDeltaTime() / 1000;

        if (this.main.inputManager.isKeyInputDown(KeyInput.THRUST_INC)) {
            this._thrustInput += dt;
        }
        else if (this.main.inputManager.isKeyInputDown(KeyInput.THRUST_DEC)) {
            this._thrustInput -= dt;
        }
        else if (this._thrustInput < 0) {
            if (Math.abs(this._thrustInput) > 0.001) {
                this._thrustInput = this._thrustInput * (1 - dt);
            }
            else {
                this._thrustInput = 0;
            }
        }
        this._thrustInput = Math.min(Math.max(this._thrustInput, - 1), 1);
        this.pilot.spaceship.thrustInput = this._thrustInput;
        
        this.pilot.spaceship.rollInput = 0;
        if (this.main.inputManager.isKeyInputDown(KeyInput.ROLL_LEFT)) {
            this.pilot.spaceship.rollInput = - 1;
        }
        else if (this.main.inputManager.isKeyInputDown(KeyInput.ROLL_RIGHT)) {
            this.pilot.spaceship.rollInput = 1;
        }
    }
}