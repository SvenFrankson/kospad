class Hud {

    public pilot: Pilot;

    public clientWidth: number = 1;
    public clientHeight: number = 1;
    public size: number = 1;
    public outerCircleRadius: number = 400;
    public reticle: SVGCircleElement; 

    constructor(
        public main: Main
    ) {

    }

    public initialize(): void {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 1000 1000");

        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.7;
        }
        else {
            this.size = this.clientWidth * 0.7;
        }

        svg.style.display = "block";
        svg.style.position = "fixed";
        svg.style.width = this.size.toFixed(0) + "px";
        svg.style.height = this.size.toFixed(0) + "px";
        svg.style.zIndex = "2";
        svg.style.left = ((this.clientWidth - this.size) * 0.5).toFixed(0) + "px";
        svg.style.top = ((this.clientHeight - this.size) * 0.5).toFixed(0) + "px";
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
        this.reticle.setAttribute("r", "50");
        this.reticle.setAttribute("fill", "none");
        this.reticle.setAttribute("stroke-width", "4");
        this.reticle.setAttribute("stroke", "white");      
        
        svg.appendChild(this.reticle);

        this.main.scene.onBeforeRenderObservable.add(this._update);
    }

    public attachPilot(pilot: HumanPilot): void {
        this.pilot = pilot;
        pilot.hud = this;
    }

    public setXInput(input: number): void {
        input = Math.min(Math.max(input, - 1), 1);

        let cx = 500 + input * this.outerCircleRadius;
        this.reticle.setAttribute("cx", cx.toFixed(1));
    }

    public setYInput(input: number): void {
        input = Math.min(Math.max(input, - 1), 1);

        let cy = 500 - input * this.outerCircleRadius;
        this.reticle.setAttribute("cy", cy.toFixed(1));
    }

    public _update = () => {
        this.setXInput(this.pilot.spaceship.yawInput);
        this.setYInput(this.pilot.spaceship.pitchInput);
    }
}