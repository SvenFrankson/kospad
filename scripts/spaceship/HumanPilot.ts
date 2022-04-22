/// <reference path="Pilot.ts"/>

class PlayerInput {

    public main: Main;

    constructor(
        public pilot: HumanPilot
    ) {
        this.main = pilot.main;
    }

    public connectInput(): void {

    }
}

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

class PlayerInputVirtualJoystick extends PlayerInput {

    public clientWidth: number = 1;
    public clientHeight: number = 1;
    public size: number = 1;
    public outerCircleRadius: number = 500;
    public reticle: SVGCircleElement; 

    public connectInput(): void {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 1000 1000");

        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.25;
        }
        else {
            this.size = this.clientWidth * 0.25;
        }

        svg.style.display = "block";
        svg.style.position = "fixed";
        svg.style.width = this.size.toFixed(0) + "px";
        svg.style.height = this.size.toFixed(0) + "px";
        svg.style.zIndex = "2";
        svg.style.right = "50px";
        svg.style.bottom = "50px";
        svg.style.pointerEvents = "none";
        
        document.body.appendChild(svg);

        let outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        outerCircle.setAttribute("cx", "500");
        outerCircle.setAttribute("cy", "500");
        outerCircle.setAttribute("r", this.outerCircleRadius.toFixed(0));
        outerCircle.setAttribute("fill", "none");
        outerCircle.setAttribute("stroke-width", "4");
        outerCircle.setAttribute("stroke", "white");      
        
        svg.appendChild(outerCircle);

        this.reticle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.reticle.setAttribute("cx", "500");
        this.reticle.setAttribute("cy", "500");
        this.reticle.setAttribute("r", (this.outerCircleRadius * 0.5).toFixed(0));
        this.reticle.setAttribute("fill", "none");
        this.reticle.setAttribute("stroke-width", "4");
        this.reticle.setAttribute("stroke", "white");      
        
        svg.appendChild(this.reticle);

        let centerX = this.clientWidth - this.size * 0.5 - 50;
        let centerY = this.clientHeight - this.size * 0.5 - 50;
        let pointerDown: boolean = false;

        this.main.canvas.addEventListener("pointerdown", (ev: PointerEvent) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - centerX) / (this.size * 0.5);
            let dy = (y - centerY) / (this.size * 0.5);
            if (dx * dx + dy * dy < 1) {
                pointerDown = true;

                let cx = 500 + dx * 250;
                this.reticle.setAttribute("cx", cx.toFixed(1));
                
                let cy = 500 + dy * 250;
                this.reticle.setAttribute("cy", cy.toFixed(1));

                this.pilot.spaceship.yawInput = Math.min(Math.max(- 1, dx), 1);
                this.pilot.spaceship.pitchInput = Math.min(Math.max(- 1, dy), 1);

                this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
            }
        });

        this.main.canvas.addEventListener("pointermove", (ev: PointerEvent) => {
            if (pointerDown) {
                let x = ev.clientX;
                let y = ev.clientY;
                let dx = (x - centerX) / (this.size * 0.5);
                let dy = (y - centerY) / (this.size * 0.5);
                if (dx * dx + dy * dy < 1) {
                    let cx = 500 + dx * 250;
                    this.reticle.setAttribute("cx", cx.toFixed(1));
                    
                    let cy = 500 + dy * 250;
                    this.reticle.setAttribute("cy", cy.toFixed(1));

                    this.pilot.spaceship.yawInput = Math.min(Math.max(- 1, dx), 1);
                    this.pilot.spaceship.pitchInput = Math.min(Math.max(- 1, dy), 1);

                    this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                    this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
                }
                else if (dx * dx + dy * dy > 4) {
                    pointerDown = false;

                    let cx = 500 + dx * 250;
                    this.reticle.setAttribute("cx", cx.toFixed(1));
                    
                    let cy = 500 + dy * 250;
                    this.reticle.setAttribute("cy", cy.toFixed(1));

                    this.pilot.spaceship.yawInput = 0;
                    this.pilot.spaceship.pitchInput = 0;
    
                    this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                    this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
                }
            }
        });

        this.main.canvas.addEventListener("pointerup", (ev: PointerEvent) => {
            let x = ev.clientX;
            let y = ev.clientY;
            let dx = (x - centerX) / (this.size * 0.5);
            let dy = (y - centerY) / (this.size * 0.5);
            if (dx * dx + dy * dy < 4) {
                pointerDown = false;

                this.reticle.setAttribute("cx", "500");
                this.reticle.setAttribute("cy", "500");

                this.pilot.spaceship.yawInput = 0;
                this.pilot.spaceship.pitchInput = 0;

                this.pilot.hud.setXInput(this.pilot.spaceship.yawInput);
                this.pilot.hud.setYInput(this.pilot.spaceship.pitchInput);
            }
        });
    }
}

class HumanPilot extends Pilot {
    
    public hud: Hud;

    public initialize(): void {

    }

    public initializeDesktop(): void {
        let input = new PlayerInputMouse(this);
        input.connectInput();
    }

    public initializeTouchScreen(): void {
        let input = new PlayerInputVirtualJoystick(this);
        input.connectInput();
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

        this.hud.setXInput(this.spaceship.yawInput);
        this.hud.setYInput(this.spaceship.pitchInput);
    }
}