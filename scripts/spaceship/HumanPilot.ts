/// <reference path="Pilot.ts"/>

class HumanPilot extends Pilot {
    
    public hud: Hud;

    public initialize(): void {
        this.main.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - this.hud.clientWidth * 0.5) / (this.hud.size * 0.5 * this.hud.outerCircleRadius / 500);
            let dy = - (y - this.hud.clientHeight * 0.5) / (this.hud.size * 0.5 * this.hud.outerCircleRadius / 500);
            this.spaceship.rollInput = Math.min(Math.max(- 1, dx), 1);
            this.spaceship.pitchInput = Math.min(Math.max(- 1, dy), 1);
        });
    }

    public attachHud(hud: Hud): void {
        this.hud = hud;
    }

    public updatePilot(): void {
        let camPos = this.spaceship.position.clone();
        camPos.addInPlace(this.spaceship.up.scale(2));
        camPos.addInPlace(this.spaceship.forward.scale(-10));

        this.main.camera.position.scaleInPlace(19).addInPlace(camPos).scaleInPlace(0.05);
        BABYLON.Quaternion.SlerpToRef(this.main.camera.rotationQuaternion, this.spaceship.rotationQuaternion, 0.05, this.main.camera.rotationQuaternion);

        this.hud.setXInput(this.spaceship.rollInput);
        this.hud.setYInput(this.spaceship.pitchInput);
    }
}