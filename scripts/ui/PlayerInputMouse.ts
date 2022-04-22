/// <reference path="PlayerInput.ts"/>

class PlayerInputMouse extends PlayerInput {

    public connectInput(): void {
        this.main.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - this.pilot.hud.clientWidth * 0.5) / (this.pilot.hud.size * 0.5 * this.pilot.hud.outerCircleRadius / 500);
            let dy = - (y - this.pilot.hud.clientHeight * 0.5) / (this.pilot.hud.size * 0.5 * this.pilot.hud.outerCircleRadius / 500);
            this.pilot.spaceship.yawInput = Math.min(Math.max(- 1, dx), 1);
            this.pilot.spaceship.pitchInput = Math.min(Math.max(- 1, dy), 1);
        });
    }
}