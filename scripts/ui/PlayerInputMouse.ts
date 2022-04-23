/// <reference path="PlayerInput.ts"/>

class PlayerInputMouse extends PlayerInput {

    public connectInput(): void {
        this.main.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            let dx = (ev.clientX - this.pilot.hud.centerX) / (this.pilot.hud.size * 0.5 * this.pilot.hud.reticleMaxRange);
            let dy = - (ev.clientY - this.pilot.hud.centerY) / (this.pilot.hud.size * 0.5 * this.pilot.hud.reticleMaxRange);
            if (dx * dx + dy * dy > 1) {
                let l = Math.sqrt(dx * dx + dy * dy);
                dx = dx / l;
                dy = dy / l;
            }
            this.pilot.spaceship.yawInput = Math.min(Math.max(- 1, dx), 1);
            this.pilot.spaceship.pitchInput = Math.min(Math.max(- 1, dy), 1);
        });
    }
}