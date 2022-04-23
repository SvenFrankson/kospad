/// <reference path="Pilot.ts"/>

class HumanPilot extends Pilot {
    
    public hud: Hud;

    public initialize(): void {

    }

    public initializeDesktop(): void {
        let mouse = new PlayerInputMouse(this);
        mouse.connectInput();
        let keyboard = new PlayerInputKeyboard(this);
        keyboard.connectInput();
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
        let dt = this.main.engine.getDeltaTime() / 1000;
        let f = dt * 2;

        let camPos = this.spaceship.position.clone();
        camPos.addInPlace(this.spaceship.up.scale(2));
        camPos.addInPlace(this.spaceship.forward.scale(-10));

        this.main.camera.position.scaleInPlace(1 - f).addInPlace(camPos.scaleInPlace(f));
        BABYLON.Quaternion.SlerpToRef(this.main.camera.rotationQuaternion, this.spaceship.rotationQuaternion, f, this.main.camera.rotationQuaternion);
    }
}