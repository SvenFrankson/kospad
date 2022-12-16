/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/babylon.gui.d.ts"/>
var input = `Valve RU has flow rate=0; tunnels lead to valves YH, ID
Valve QK has flow rate=24; tunnels lead to valves PQ, PP
Valve RP has flow rate=11; tunnels lead to valves RM, BA, RI, EM
Valve BX has flow rate=0; tunnels lead to valves ZX, VK
Valve JL has flow rate=0; tunnels lead to valves ID, LC
Valve DC has flow rate=25; tunnel leads to valve ST
Valve HX has flow rate=0; tunnels lead to valves DH, FE
Valve KJ has flow rate=0; tunnels lead to valves ZK, XN
Valve EM has flow rate=0; tunnels lead to valves AW, RP
Valve XN has flow rate=7; tunnels lead to valves LH, KJ, KU, AO
Valve DH has flow rate=9; tunnels lead to valves SY, CC, QL, LH, HX
Valve LH has flow rate=0; tunnels lead to valves XN, DH
Valve PP has flow rate=0; tunnels lead to valves QK, TA
Valve AO has flow rate=0; tunnels lead to valves AA, XN
Valve SY has flow rate=0; tunnels lead to valves DH, AA
Valve MZ has flow rate=0; tunnels lead to valves JT, PF
Valve AA has flow rate=0; tunnels lead to valves JN, UN, WG, SY, AO
Valve RM has flow rate=0; tunnels lead to valves XL, RP
Valve BA has flow rate=0; tunnels lead to valves RP, YP
Valve AD has flow rate=12; tunnels lead to valves LK, ZX, AW
Valve ZN has flow rate=0; tunnels lead to valves EQ, HL
Valve EX has flow rate=18; tunnel leads to valve RB
Valve CR has flow rate=0; tunnels lead to valves TA, ST
Valve WG has flow rate=0; tunnels lead to valves AA, TA
Valve UN has flow rate=0; tunnels lead to valves WK, AA
Valve VE has flow rate=0; tunnels lead to valves JA, KW
Valve JA has flow rate=19; tunnels lead to valves PQ, VE
Valve AW has flow rate=0; tunnels lead to valves AD, EM
Valve XL has flow rate=0; tunnels lead to valves RM, PF
Valve OD has flow rate=0; tunnels lead to valves VK, RI
Valve FE has flow rate=0; tunnels lead to valves JT, HX
Valve PQ has flow rate=0; tunnels lead to valves JA, QK
Valve RB has flow rate=0; tunnels lead to valves CC, EX
Valve JT has flow rate=3; tunnels lead to valves RF, MZ, ZK, FE, DD
Valve YP has flow rate=0; tunnels lead to valves ID, BA
Valve ID has flow rate=14; tunnels lead to valves JL, RU, YP
Valve YH has flow rate=0; tunnels lead to valves RU, VK
Valve TA has flow rate=21; tunnels lead to valves WG, KU, PP, RF, CR
Valve LK has flow rate=0; tunnels lead to valves PF, AD
Valve DD has flow rate=0; tunnels lead to valves JN, JT
Valve HL has flow rate=0; tunnels lead to valves ZN, DW
Valve VK has flow rate=22; tunnels lead to valves OD, KW, BX, YH
Valve RF has flow rate=0; tunnels lead to valves JT, TA
Valve CC has flow rate=0; tunnels lead to valves RB, DH
Valve KW has flow rate=0; tunnels lead to valves VE, VK
Valve PF has flow rate=10; tunnels lead to valves WK, MZ, QL, XL, LK
Valve ZX has flow rate=0; tunnels lead to valves AD, BX
Valve JN has flow rate=0; tunnels lead to valves DD, AA
Valve ST has flow rate=0; tunnels lead to valves CR, DC
Valve WK has flow rate=0; tunnels lead to valves PF, UN
Valve DW has flow rate=13; tunnels lead to valves LC, HL
Valve ZK has flow rate=0; tunnels lead to valves KJ, JT
Valve QL has flow rate=0; tunnels lead to valves DH, PF
Valve RI has flow rate=0; tunnels lead to valves OD, RP
Valve EQ has flow rate=23; tunnel leads to valve ZN
Valve LC has flow rate=0; tunnels lead to valves JL, DW
Valve KU has flow rate=0; tunnels lead to valves XN, TA`;
let testInput = `Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`;
var Tile;
(function (Tile) {
    Tile[Tile["Air"] = 0] = "Air";
    Tile[Tile["Rock"] = 1] = "Rock";
    Tile[Tile["Sand"] = 2] = "Sand";
})(Tile || (Tile = {}));
class Valve {
    name;
    flow;
    connected = [];
    distances = new Map();
    cost = Infinity;
    flowZero = 0;
    element;
    x;
    y;
    constructor(name, flow) {
        this.name = name;
        this.flow = flow;
        this.flowZero = flow;
    }
    connect(other) {
        if (this.connected.indexOf(other) === -1) {
            this.connected.push(other);
        }
        if (other.connected.indexOf(this) === -1) {
            other.connected.push(this);
        }
    }
    setCost(c) {
        this.cost = c;
        for (let i = 0; i < this.connected.length; i++) {
            let other = this.connected[i];
            if (other.cost > c + 1) {
                other.setCost(c + 1);
            }
        }
    }
    setDistance(v, d) {
        if (!this.distances.get(v.name) || this.distances.get(v.name) > d) {
            this.distances.set(v.name, d);
            for (let i = 0; i < this.connected.length; i++) {
                let other = this.connected[i];
                other.setDistance(v, d + 1);
            }
        }
    }
}
class Main {
    firstValve;
    maxFlow = 0;
    totalFlow = 0;
    flown = 0;
    valves = [];
    ap = 30;
    resetAll() {
        for (let i = 0; i < this.valves.length; i++) {
            this.valves[i].cost = Infinity;
            this.valves[i].flow = this.valves[i].flowZero;
        }
        this.totalFlow = 0;
        this.flown = 0;
        this.ap = 30;
    }
    resetCosts() {
        for (let i = 0; i < this.valves.length; i++) {
            this.valves[i].cost = Infinity;
        }
    }
    sortValves() {
        this.valves = this.valves.sort((v1, v2) => { return v2.flow / v2.cost - v1.flow / v1.cost; });
    }
    constructor() {
        let splitInput = input.split("\n");
        for (let n = 0; n < 2; n++) {
            for (let i = 0; i < splitInput.length; i++) {
                //Valve RU has flow rate=0; tunnels lead to valves YH, ID
                let line = splitInput[i];
                line = line.replace("Valve ", "");
                line = line.replace(" has flow rate=", ";");
                let name = line.split(";")[0];
                let flow = parseInt(line.split(";")[1]);
                this.maxFlow += flow;
                let valve = this.valves.find(v => { return v.name === name; });
                if (!valve) {
                    valve = new Valve(name, flow);
                    this.valves.push(valve);
                }
                line = line.split(";")[2];
                line = line.replace(" tunnels lead to valves ", "");
                line = line.replace(" tunnel leads to valve ", "");
                let otherNames = line.split(", ");
                for (let j = 0; j < otherNames.length; j++) {
                    let other = this.valves.find(v => { return v.name === otherNames[j]; });
                    if (other) {
                        valve.connect(other);
                    }
                }
            }
        }
        for (let i = 0; i < this.valves.length; i++) {
            let v = this.valves[i];
            let l = v.name + " : " + v.flow + ". ";
            v.connected.forEach(c => {
                l += c.name + " ";
            });
            console.log(l);
        }
        for (let i = 0; i < this.valves.length; i++) {
            let v = this.valves[i];
            v.x = 1000 * Math.random();
            v.y = 1000 * Math.random();
        }
        this.valves.find(v => { return v.name === "DC"; }).x = 0;
        this.valves.find(v => { return v.name === "DC"; }).y = 0;
        this.valves.find(v => { return v.name === "EX"; }).x = 0;
        this.valves.find(v => { return v.name === "EX"; }).y = 500;
        this.valves.find(v => { return v.name === "EQ"; }).x = 1000;
        this.valves.find(v => { return v.name === "EQ"; }).y = 0;
        for (let n = 0; n < 100; n++) {
            for (let i = 0; i < this.valves.length; i++) {
                let v = this.valves[i];
                for (let j = 0; j < this.valves.length; j++) {
                    if (i != j) {
                        let other = this.valves[j];
                        let x = v.x - other.x;
                        let y = v.y - other.y;
                        let d = Math.sqrt(x * x + y * y);
                        if (d < 200) {
                            x = x / d;
                            y = y / d;
                            let f = 1;
                            v.x += f * x;
                            v.y += f * y;
                        }
                    }
                }
                for (let j = 0; j < v.connected.length; j++) {
                    let other = v.connected[j];
                    let x = v.x - other.x;
                    let y = v.y - other.y;
                    let d = Math.sqrt(x * x + y * y);
                    x = x / d;
                    y = y / d;
                    let f = 0.1 * (40 - d);
                    v.x += f * x;
                    v.y += f * y;
                }
            }
        }
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        document.body.appendChild(svg);
        svg.style.position = "fixed";
        svg.style.width = "100%";
        svg.style.height = "100%";
        for (let i = 0; i < this.valves.length; i++) {
            let v = this.valves[i];
            v.element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            v.element.setAttribute("x", (v.x - 5).toFixed(1));
            v.element.setAttribute("y", (v.y - 5).toFixed(1));
            v.element.setAttribute("width", "10");
            v.element.setAttribute("height", "10");
            v.element.setAttribute("fill", "black");
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", (v.x - 5).toFixed(1));
            text.setAttribute("y", (v.y - 5).toFixed(1));
            text.textContent = v.name + " " + v.flow;
            text.setAttribute("fill", "grey");
            if (v.flow > 0) {
                text.setAttribute("fill", "lime");
            }
            if (v.flow > 10) {
                text.setAttribute("fill", "red");
            }
            for (let j = 0; j < v.connected.length; j++) {
                let l = document.createElementNS("http://www.w3.org/2000/svg", "line");
                l.setAttribute("x1", v.x.toFixed(1));
                l.setAttribute("y1", v.y.toFixed(1));
                l.setAttribute("x2", v.connected[j].x.toFixed(1));
                l.setAttribute("y2", v.connected[j].y.toFixed(1));
                l.setAttribute("stroke", "black");
                svg.appendChild(l);
            }
            svg.appendChild(v.element);
            svg.appendChild(text);
        }
        if (false) {
            this.valves = [];
            for (let i = 0; i < 20; i++) {
                let valve = new Valve("V" + i.toFixed(0), 1);
                this.valves.push(valve);
                this.maxFlow += valve.flow;
                if (this.valves[i - 1]) {
                    valve.connect(this.valves[i - 1]);
                }
            }
            this.valves[0].flow = 0;
        }
        this.firstValve = this.valves.find(v => { return v.name === "AA"; });
        this.firstValve.setDistance(this.firstValve, 1);
        this.valves.forEach(v => {
            if (v.flow > 0) {
                v.setDistance(v, 1);
            }
        });
        this.valves = this.valves.filter(v => { return v.flow > 0; });
        //this.valves = this.valves.sort((v1, v2) => { return (v2.flow - v2.distances.get(this.firstValve.name)) - (v1.flow - v1.distances.get(this.firstValve.name)); });
        console.log(...this.valves);
    }
    doRun() {
        let bestRun;
        let prevScore = this.evaluate(this.valves).score;
        for (let i = 0; i < 10000; i++) {
            let prev = [...this.valves];
            let permuts = Math.ceil(this.valves.length * Math.random() * 0.5);
            for (let n = 0; n < permuts; n++) {
                let r1 = Math.floor(Math.random() * this.valves.length);
                let r2 = Math.floor(Math.random() * this.valves.length);
                let tmp = this.valves[r1];
                this.valves[r1] = this.valves[r2];
                this.valves[r2] = tmp;
            }
            let run = this.evaluate(this.valves);
            if (!bestRun || run.score > bestRun.score) {
                bestRun = run;
            }
            if (run.score < prevScore) {
                this.valves = prev;
            }
            else {
                prevScore = run.score;
            }
        }
        return bestRun;
    }
    evaluate(valves) {
        let minute = 0;
        let n = 0;
        let score = 0;
        let order = [];
        while (minute < 30 && n < valves.length) {
            let v = valves[n];
            if (v) {
                let prev = valves[n - 1];
                if (!prev) {
                    prev = this.firstValve;
                }
                let d = v.distances.get(prev.name);
                if (minute + d < 30) {
                    minute += d;
                    order.push("min " + minute + " open " + v.name);
                    score += (30 - minute) * v.flow;
                }
            }
            n++;
        }
        order.push(minute.toFixed(0) + " min");
        return { score: score, order: order };
    }
    actions;
    doRun2() {
        let score = 0;
        for (let i = 0; i < 10000; i++) {
            this.resetAll();
            let actions = [];
            let currentValve = this.firstValve;
            while (this.ap > 0) {
                this.resetCosts();
                currentValve.setCost(1);
                this.sortValves();
                let doable = this.valves.filter(v => { return v.cost < this.ap && v.flow > 0; });
                if (doable.length === 0) {
                    this.flown += this.totalFlow;
                    this.ap--;
                    actions.push("minute = " + (30 - this.ap) + " flow is " + this.totalFlow + " flown = " + this.flown);
                }
                else {
                    let best;
                    let r = Math.random();
                    r = r * r * r * r;
                    let vIndex = 0;
                    if (Math.random() > 0.5) {
                        vIndex = Math.floor(Math.random() * doable.length);
                    }
                    /*
                    let f = 0.3
                    if (r < f) {
                        vIndex = 1;
                    }
                    else if (r < f * f) {
                        vIndex = 2;
                    }
                    else if (r < f * f * f) {
                        vIndex = 3;
                    }
                    else if (r < f * f * f * f) {
                        vIndex = 4;
                    }
                    */
                    best = doable[vIndex];
                    for (let n = 0; n < best.cost; n++) {
                        this.ap--;
                        this.flown += this.totalFlow;
                        actions.push("minute = " + (30 - this.ap) + " flow is " + this.totalFlow + " flown = " + this.flown);
                    }
                    actions.push("minute = " + (30 - this.ap) + " Move to " + best.name + " (" + best.flow + ") for " + best.cost);
                    this.totalFlow += best.flow;
                    best.flow = 0;
                    currentValve = best;
                }
            }
            actions.push("AP left = " + this.ap);
            if (this.flown > score) {
                score = this.flown;
                this.actions = actions;
            }
        }
        return score;
    }
}
window.addEventListener("load", async () => {
    let main = new Main();
    let bestRun = 0;
    let bestOrder = [];
    let hey = 0;
    let baseValves = [...main.valves];
    let loop = () => {
        let run = main.doRun();
        if (bestRun < run.score) {
            bestRun = run.score;
            bestOrder = run.order;
            console.log("new bestrun = " + bestRun);
            console.log(run.order);
            hey = 0;
        }
        else {
            hey++;
        }
        if (hey > 60) {
            console.log("hey");
            hey = 0;
            main.valves = baseValves.filter(v => { return Math.random() > 0.05; });
            main.valves = main.valves.sort((v1, v2) => { return Math.random() - 0.5; });
            console.log(main.valves.map(v => { return v.name; }));
        }
        requestAnimationFrame(loop);
    };
    loop();
});
