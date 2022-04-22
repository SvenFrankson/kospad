/// <reference path="Pilot.ts"/>

class HumanPilot extends Pilot {
    
    public hud: Hud;

    public initialize(): void {

    }

    public initializeDesktop(): void {
        let input = new PlayerInputMouse(this);
        input.connectInput();
    }

    public initializeTouchScreen(): void {
        let input = new PlayerInputVirtualPad(this);
        input.connectInput();
    }

    public attachHud(hud: Hud): void {
        this.hud = hud;
        hud.pilot = this;
    }

    public updatePilot(): void {
        let camPos = this.spaceship.position.clone();
        camPos.addInPlace(this.spaceship.up.scale(2));
        camPos.addInPlace(this.spaceship.forward.scale(-10));

        this.main.camera.position.scaleInPlace(19).addInPlace(camPos).scaleInPlace(0.05);
        BABYLON.Quaternion.SlerpToRef(this.main.camera.rotationQuaternion, this.spaceship.rotationQuaternion, 0.05, this.main.camera.rotationQuaternion);

        this.hud.setXInput(this.spaceship.yawInput);
        this.hud.setYInput(this.spaceship.pitchInput);
    }
}