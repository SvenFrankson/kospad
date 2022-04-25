class Hud {

    public pilot: Pilot;

    public initialized: boolean = false;

    public clientWidth: number = 0;
    public clientHeight: number = 0;
    public centerX: number = 0;
    public centerY: number = 0;
    public size: number = 0;
    public reticleMaxRange: number = 0.65;
    public svgPerPixel: number = 1;

    public root: SVGSVGElement;
    public reticleRoot: SVGSVGElement;
    public rightGaugeForwardValue: SVGPathElement;
    public rightGaugeBackwardValue: SVGPathElement;
    public rightGaugeCursor: SVGPathElement;
    public leftGaugeValue: SVGPathElement;
    public pitchGaugeCursor: SVGPathElement;
    public pitchGaugeValues: SVGTextElement[] = [];
    public rollGaugeCursor: SVGPathElement;
    public compassGaugeCursor: SVGPathElement;
    public compassGaugeValues: SVGTextElement[] = [];

    public strokeWidthLite: string = "2";
    public strokeWidth: string = "4";
    public strokeWidthHeavy: string = "6";

    constructor(
        public main: Main
    ) {

    }

    public resize(sizeInPercent: number): void {
        if (!this.initialized) {
            return;
        }

        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.size = Math.floor(Math.min(this.clientWidth, this.clientHeight) * sizeInPercent);
        this.centerX = this.clientWidth * 0.5;
        this.centerY = this.clientHeight * 0.5;
        this.svgPerPixel = 2000 / this.size;

        [this.root, this.reticleRoot].forEach(e => {
            e.setAttribute("width", this.size.toFixed(0));
            e.setAttribute("height", this.size.toFixed(0));
    
            e.style.position = "fixed";
            e.style.left = ((this.clientWidth - this.size) * 0.5).toFixed(1) + "px";
            e.style.top = ((this.clientHeight - this.size) * 0.5).toFixed(1) + "px";
            e.style.width = this.size.toFixed(1) + "px";
            e.style.height = this.size.toFixed(1) + "px";
        });
    }

    public initialize(): void {
        this.root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.root.setAttribute("id", "hud-root");
        this.root.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.root.style.overflow = "visible";
        this.root.style.pointerEvents = "none";
        document.body.appendChild(this.root);

        let outterRing = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let outterRingD = SvgUtils.drawArc(30, 88, 770, true);
        outterRingD += SvgUtils.drawArc(92, 150, 770, true);
        outterRingD += SvgUtils.drawArc(30, 60, 800, true);
        outterRingD += SvgUtils.lineToPolar(60, 830);
        outterRingD += SvgUtils.drawArc(60, 120, 830);
        outterRingD += SvgUtils.lineToPolar(120, 800);
        outterRingD += SvgUtils.drawArc(120, 150, 800);

        outterRingD += SvgUtils.lineFromToPolar(88, 770, 89.5, 745);
        outterRingD += SvgUtils.drawArc(89.5, 90.5, 745, true);
        outterRingD += SvgUtils.lineToPolar(92, 770);

        outterRingD += SvgUtils.drawArc(210, 268, 770, true);
        outterRingD += SvgUtils.drawArc(272, 330, 770, true);
        outterRingD += SvgUtils.drawArc(210, 240, 800, true);
        outterRingD += SvgUtils.lineToPolar(240, 830);
        outterRingD += SvgUtils.drawArc(240, 300, 830);
        outterRingD += SvgUtils.lineToPolar(300, 800);
        outterRingD += SvgUtils.drawArc(300, 330, 800);

        outterRingD += SvgUtils.lineFromToPolar(268, 770, 269.5, 745);
        outterRingD += SvgUtils.drawArc(269.5, 270.5, 745, true);
        outterRingD += SvgUtils.lineToPolar(272, 770);


        outterRing.setAttribute("d", outterRingD);
        outterRing.setAttribute("fill", "none");
        outterRing.setAttribute("stroke", "white");
        outterRing.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(outterRing);

        this.rightGaugeForwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeForwardValueD = SvgUtils.drawArc(340, 30, 770, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(30, 860);
        rightGaugeForwardValueD += SvgUtils.drawArc(30, 340, 860, false, true);
        rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
        this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
        this.rightGaugeForwardValue.setAttribute("fill", "rgba(255, 127, 0, 50%)");
        this.rightGaugeForwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeForwardValue);

        this.rightGaugeBackwardValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeBackwardValueD = SvgUtils.drawArc(330, 340, 770, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 860);
        rightGaugeBackwardValueD += SvgUtils.drawArc(340, 330, 860, false, true);
        rightGaugeBackwardValueD += SvgUtils.lineToPolar(330, 770);
        this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
        this.rightGaugeBackwardValue.setAttribute("fill", "rgba(0, 127, 255, 50%)");
        this.rightGaugeBackwardValue.setAttribute("stroke", "none");
        this.root.appendChild(this.rightGaugeBackwardValue);

        let rightGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeD = SvgUtils.drawArc(330, 30, 770, true);
        rightGaugeD += SvgUtils.lineToPolar(30, 860);
        rightGaugeD += SvgUtils.drawArc(30, 330, 860, false, true);
        rightGaugeD += SvgUtils.lineToPolar(330, 770);
        rightGaugeD += SvgUtils.lineFromToPolar(340, 770, 340, 860);
        rightGauge.setAttribute("d", rightGaugeD);
        rightGauge.setAttribute("fill", "none");
        rightGauge.setAttribute("stroke", "white");
        rightGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(rightGauge);

        let rightGaugeGraduations = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeGraduationsD = "";
        for (let i = 1; i < 12; i++) {
            let a = 330 + i * 5;
            rightGaugeGraduationsD += SvgUtils.lineFromToPolar(a, 830, a, 860);
        }
        rightGaugeGraduations.setAttribute("d", rightGaugeGraduationsD);
        rightGaugeGraduations.setAttribute("fill", "none");
        rightGaugeGraduations.setAttribute("stroke", "white");
        rightGaugeGraduations.setAttribute("stroke-width", this.strokeWidthLite);
        this.root.appendChild(rightGaugeGraduations);

        this.rightGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rightGaugeCursorD = SvgUtils.drawArc(1, 359, 900, true, true);
        rightGaugeCursorD += SvgUtils.lineToPolar(0, 870);
        rightGaugeCursorD += SvgUtils.lineToPolar(1, 900);
        this.rightGaugeCursor.setAttribute("d", rightGaugeCursorD);
        this.rightGaugeCursor.setAttribute("fill", "white");
        this.rightGaugeCursor.setAttribute("fill-opacity", "50%");
        this.root.appendChild(this.rightGaugeCursor);

        let leftGauge = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let leftGaugeD = SvgUtils.drawArc(150, 210, 770, true);
        leftGaugeD += SvgUtils.lineToPolar(210, 860);
        leftGaugeD += SvgUtils.drawArc(210, 150, 860, false, true);
        leftGaugeD += SvgUtils.lineToPolar(150, 770);
        leftGauge.setAttribute("d", leftGaugeD);
        leftGauge.setAttribute("fill", "none");
        leftGauge.setAttribute("stroke", "white");
        leftGauge.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(leftGauge);

        this.reticleRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.reticleRoot.setAttribute("id", "hud-target-root");
        this.reticleRoot.setAttribute("viewBox", "-1000 -1000 2000 2000");
        this.reticleRoot.style.overflow = "visible";
        this.reticleRoot.style.pointerEvents = "none";
        document.body.appendChild(this.reticleRoot);

        /*
        let debugSquare2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        debugSquare2.setAttribute("x", "-1000");
        debugSquare2.setAttribute("y", "-1000");
        debugSquare2.setAttribute("width", "2000");
        debugSquare2.setAttribute("height", "2000");
        debugSquare2.setAttribute("fill", "rgba(255, 0, 255, 50%)");
        this.reticleRoot.appendChild(debugSquare2);
        */

        let reticle = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let reticleD = SvgUtils.drawArc(300, 60, 100, true) + SvgUtils.drawArc(120, 240, 100, true);
        reticle.setAttribute("d", reticleD);
        reticle.setAttribute("fill", "none");
        reticle.setAttribute("stroke", "white");
        reticle.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticle);

        let reticleArmLeft = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmLeft.setAttribute("x1", "-20");
        reticleArmLeft.setAttribute("y1", "0");
        reticleArmLeft.setAttribute("x2", "-100");
        reticleArmLeft.setAttribute("y2", "0");
        reticleArmLeft.setAttribute("fill", "none");
        reticleArmLeft.setAttribute("stroke", "white");
        reticleArmLeft.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticleArmLeft);

        let reticleArmRight = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmRight.setAttribute("x1", "20");
        reticleArmRight.setAttribute("y1", "0");
        reticleArmRight.setAttribute("x2", "100");
        reticleArmRight.setAttribute("y2", "0");
        reticleArmRight.setAttribute("fill", "none");
        reticleArmRight.setAttribute("stroke", "white");
        reticleArmRight.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticleArmRight);

        let reticleArmBottom = document.createElementNS("http://www.w3.org/2000/svg", "line");
        reticleArmBottom.setAttribute("x1", "0");
        reticleArmBottom.setAttribute("y1", "20");
        reticleArmBottom.setAttribute("x2", "0");
        reticleArmBottom.setAttribute("y2", "100");
        reticleArmBottom.setAttribute("fill", "none");
        reticleArmBottom.setAttribute("stroke", "white");
        reticleArmBottom.setAttribute("stroke-width", this.strokeWidth);
        this.reticleRoot.appendChild(reticleArmBottom);

        let pitchGaugeAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        pitchGaugeAxis.setAttribute("x1", "-500");
        pitchGaugeAxis.setAttribute("y1", "-550");
        pitchGaugeAxis.setAttribute("x2", "-500");
        pitchGaugeAxis.setAttribute("y2", "550");
        pitchGaugeAxis.setAttribute("fill", "none");
        pitchGaugeAxis.setAttribute("stroke", "white");
        pitchGaugeAxis.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(pitchGaugeAxis);

        this.pitchGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.pitchGaugeCursor.setAttribute("fill", "none");
        this.pitchGaugeCursor.setAttribute("stroke", "white");
        this.pitchGaugeCursor.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(this.pitchGaugeCursor);

        for (let i = 0; i < 3; i++) {
            this.pitchGaugeValues[i] = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.pitchGaugeValues[i].setAttribute("fill", "white");
            this.pitchGaugeValues[i].setAttribute("text-anchor", "end");
            this.pitchGaugeValues[i].setAttribute("font-family", "Consolas");
            this.pitchGaugeValues[i].setAttribute("font-size", "40");
            this.root.appendChild(this.pitchGaugeValues[i]);
        }

        this.rollGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let rollGaugeCursorD = SvgUtils.drawArc(250, 290, 740, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(290, 720);
        rollGaugeCursorD += SvgUtils.drawArc(290, 271, 720, false, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(271, 700);
        rollGaugeCursorD += SvgUtils.drawArc(271, 269, 700, false, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(269, 720);
        rollGaugeCursorD += SvgUtils.drawArc(269, 250, 720, false, true);

        rollGaugeCursorD += SvgUtils.lineToPolar(250, 740);
        rollGaugeCursorD += SvgUtils.drawArc(87, 93, 710, true);
        rollGaugeCursorD += SvgUtils.lineToPolar(90, 740);
        rollGaugeCursorD += SvgUtils.lineToPolar(87, 710);
        this.rollGaugeCursor.setAttribute("d", rollGaugeCursorD);
        this.rollGaugeCursor.setAttribute("fill", "white");
        this.rollGaugeCursor.setAttribute("fill-opacity", "50%");
        this.root.appendChild(this.rollGaugeCursor);

        this.compassGaugeCursor = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.compassGaugeCursor.setAttribute("fill", "none");
        this.compassGaugeCursor.setAttribute("stroke", "white");
        this.compassGaugeCursor.setAttribute("stroke-width", this.strokeWidth);
        this.root.appendChild(this.compassGaugeCursor);

        for (let i = 0; i < 3; i++) {
            this.compassGaugeValues[i] = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.compassGaugeValues[i].setAttribute("fill", "white");
            this.compassGaugeValues[i].setAttribute("text-anchor", "middle");
            this.compassGaugeValues[i].setAttribute("font-family", "Consolas");
            this.compassGaugeValues[i].setAttribute("font-size", "40");
            this.root.appendChild(this.compassGaugeValues[i]);
        }
    
        this.main.scene.onBeforeRenderObservable.add(this._update);

        this.initialized = true;
    }

    public attachPilot(pilot: HumanPilot): void {
        this.pilot = pilot;
        pilot.hud = this;
    }

    public setReticlePos(x: number, y: number): void {
        let dx = x * this.size * 0.5 * this.reticleMaxRange;
        let dy = y * this.size * 0.5 * this.reticleMaxRange;
        this.reticleRoot.style.left = ((this.clientWidth - this.size) * 0.5 + dx).toFixed(1) + "px";
        this.reticleRoot.style.top = ((this.clientHeight - this.size) * 0.5 - dy).toFixed(1) + "px";
        this.reticleRoot.style.clipPath = "circle(" + (this.size * 0.5 * this.reticleMaxRange + (100 + 4) / this.svgPerPixel).toFixed(0) + "px at " + (- dx + this.size * 0.5).toFixed(1) + "px " + (-dy + this.size * 0.5).toFixed(1) + "px)";
    }

    public setTargetSpeed(s: number): void {
        if (s > 0) {
            this.rightGaugeForwardValue.setAttribute("visibility", "visible");
            let a = 340 * (1 - s) + 390 * s;
            let rightGaugeForwardValueD = SvgUtils.drawArc(340, a, 770, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(a, 860);
            rightGaugeForwardValueD += SvgUtils.drawArc(a, 340, 860, false, true);
            rightGaugeForwardValueD += SvgUtils.lineToPolar(340, 770);
            this.rightGaugeForwardValue.setAttribute("d", rightGaugeForwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeForwardValue.setAttribute("visibility", "hidden");
        }
        if (s < 0) {
            this.rightGaugeBackwardValue.setAttribute("visibility", "visible");
            s = - s;
            let a = 340 * (1 - s) + 330 * s;
            let rightGaugeBackwardValueD = SvgUtils.drawArc(a, 340, 770, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(340, 860);
            rightGaugeBackwardValueD += SvgUtils.drawArc(340, a, 860, false, true);
            rightGaugeBackwardValueD += SvgUtils.lineToPolar(a, 770);
            this.rightGaugeBackwardValue.setAttribute("d", rightGaugeBackwardValueD);
            this.rightGaugeCursor.setAttribute("transform", "rotate(-" + a + " 0 0)");
        }
        else {
            this.rightGaugeBackwardValue.setAttribute("visibility", "hidden");
        }
        if (s === 0) {
            this.rightGaugeCursor.setAttribute("transform", "rotate(-340 0 0)");
        }
    }

    public setPitchRoll(p: number, r: number): void {
        let n = 0;
        let d = "";
        for (let i = - 18; i <= 18; i++) {
            let y = (i * 10 + p) * 40;
            if (Math.abs(y) < 550) {
                d += "M -500 " + y.toFixed(0) + " L -480 " + y.toFixed(0) + " ";
                let textSVG = this.pitchGaugeValues[n];
                if (textSVG) {
                    textSVG.innerHTML = (- i * 10).toFixed(0).padStart(4, "");
                    textSVG.setAttribute("x", "-520");
                    textSVG.setAttribute("y", (y + 10).toFixed(1));
                    let v = 1 - (Math.abs(y) - 275) / 275;
                    v = Math.min(1, v);
                    let vRoll = Math.abs(Math.abs(r) - 90) / 10;
                    vRoll = Math.min(1, vRoll);
                    textSVG.setAttribute("fill-opacity", (v * vRoll * 100).toFixed(0) + "%");
                    n++;
                }
            }
        }
        for (let i = n; i < 3; i++) {
            let textSVG = this.pitchGaugeValues[n];
            textSVG.setAttribute("fill-opacity", "0%");
        }
        this.pitchGaugeCursor.setAttribute("d", d);
        this.rollGaugeCursor.setAttribute("transform", "rotate(" + (- r).toFixed(1) + " 0 0)")
    }

    public setHeading(h: number): void {
        let n = 0;
        let d = "";
        for (let i = 0; i < 72; i++) {
            let a = i * 5 + h;
            if (a > 360) {
                a = a - 360;
            }
            if (a > 242 && a < 298) {
                if (i % 4 === 0) {
                    let textSVG = this.compassGaugeValues[n];
                    if (textSVG) {
                        textSVG.innerHTML = (i * 5 / 10).toFixed(0);
                        textSVG.setAttribute("x", "0")
                        textSVG.setAttribute("y", "810");
                        textSVG.setAttribute("transform", "rotate(" + (- (a - 270)).toFixed(1) + " 0 0)");
                        let v = (1 - Math.abs(270 - a) / 28) * 2;
                        v = Math.min(1, v);
                        textSVG.setAttribute("fill-opacity", (v * 100).toFixed(0) + "%");
                        n++;
                    }
                }
                else {
                    d += SvgUtils.lineFromToPolar(a, 790, a, 810);
                }
            }
        }
        for (let i = n; i < 3; i++) {
            let textSVG = this.compassGaugeValues[n];
            textSVG.setAttribute("fill-opacity", "0%");
        }
        this.compassGaugeCursor.setAttribute("d", d);
    }

    public _update = () => {
        this.setReticlePos(this.pilot.spaceship.yawInput, this.pilot.spaceship.pitchInput);
        this.setTargetSpeed(this.pilot.spaceship.thrustInput);
        let pitch = Math.asin(this.pilot.spaceship.forward.y) / Math.PI * 180;
        let roll = - VMath.AngleFromToAround(BABYLON.Axis.Y, this.pilot.spaceship.up, this.pilot.spaceship.forward) / Math.PI * 180;
        if (Math.abs(roll) > 90) {
            if (pitch > 0) {
                pitch =  180 - pitch;
            }
            else {
                pitch = - 180 - pitch;
            }
        }
        this.setPitchRoll(pitch, roll);
        let heading = VMath.AngleFromToAround(BABYLON.Axis.Z, this.pilot.spaceship.forward, BABYLON.Axis.Y, true) / Math.PI * 180;
        this.setHeading(heading);
    }
}