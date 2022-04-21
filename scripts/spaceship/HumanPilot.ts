/// <reference path="Pilot.ts"/>

class HumanPilot extends Pilot {
    
    public hud: Hud;

    public initialize(): void {
        this.main.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - this.hud.clientWidth * 0.5) / (this.hud.size * 0.5 * this.hud.outerCircleRadius / 500);
            let dy = - (y - this.hud.clientHeight * 0.5) / (this.hud.size * 0.5 * this.hud.outerCircleRadius / 500);
            this.hud.setYawInput(dx);
            this.hud.setPitchInput(dy);
        });
    }

    public attachHud(hud: Hud): void {
        this.hud = hud;
    }

    public updatePilot(): void {
        
    }
}