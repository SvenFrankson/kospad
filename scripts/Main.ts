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
Valve KU has flow rate=0; tunnels lead to valves XN, TA`

let testInput = `Valve BB has flow rate=13; tunnels lead to valves CC, AA
Valve CC has flow rate=2; tunnels lead to valves DD, BB
Valve DD has flow rate=20; tunnels lead to valves CC, AA, EE
Valve EE has flow rate=3; tunnels lead to valves FF, DD
Valve FF has flow rate=0; tunnels lead to valves EE, GG
Valve AA has flow rate=0; tunnels lead to valves DD, II, BB
Valve GG has flow rate=0; tunnels lead to valves FF, HH
Valve HH has flow rate=22; tunnel leads to valve GG
Valve II has flow rate=0; tunnels lead to valves AA, JJ
Valve JJ has flow rate=21; tunnel leads to valve II`

enum Tile {
	Air,
	Rock,
	Sand
}

class Valve {

	public connected: Valve[] = [];
	public distances: Map<string, number> = new Map<string,number>();

	public element: SVGElement;
	public x: number;
	public y: number;

	constructor(public name: string, public flow: number) {
		
	}

	public connect(other: Valve): void {
		if (this.connected.indexOf(other) === - 1) {
			this.connected.push(other);
		}
		if (other.connected.indexOf(this) === - 1) {
			other.connected.push(this);
		}
	}

	public setDistance(v: Valve, d: number): void {
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

	public firstValve: Valve;
	public valves: Valve[] = [];
	
	private _bestScore = 0;
	private _bestDepth = [];

    constructor() {
		
		let splitInput = input.split("\n");
		
		for (let i = 0; i < splitInput.length; i++) {
			//Valve RU has flow rate=0; tunnels lead to valves YH, ID
			let line = splitInput[i];
			line = line.replace("Valve ", "");
			line = line.replace(" has flow rate=", ";");
			let name = line.split(";")[0];
			let flow = parseInt(line.split(";")[1]);
			let valve = this.valves.find(v => { return v.name === name});
			if (!valve) {
				valve = new Valve(name, flow);
				this.valves.push(valve);
			}
			line = line.split(";")[2];
			line = line.replace(" tunnels lead to valves ", "");
			line = line.replace(" tunnel leads to valve ", "");
			let otherNames = line.split(", ");
			for (let j = 0; j < otherNames.length; j++) {
				let other = this.valves.find(v => { return v.name === otherNames[j] });
				if (other) {
					valve.connect(other);
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

		for (let n = 0; n < 300; n++) {
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
			v.element = document.createElementNS("http://www.w3.org/2000/svg", "rect") as SVGRectElement;
			v.element.setAttribute("x", (v.x - 5).toFixed(1));
			v.element.setAttribute("y", (v.y - 5).toFixed(1));
			v.element.setAttribute("width", "10");
			v.element.setAttribute("height", "10");
			v.element.setAttribute("fill", "black");

			let text = document.createElementNS("http://www.w3.org/2000/svg", "text") as SVGTextElement;
			text.setAttribute("x", (v.x - 20).toFixed(1));
			text.setAttribute("y", (v.y - 10).toFixed(1));
			text.textContent = v.name + " " + v.flow;
			text.setAttribute("fill", "grey");
			if (v.flow > 0) {
				text.setAttribute("fill", "lime");
			}
			if (v.flow > 10) {
				text.setAttribute("fill", "red");
			}

			for (let j = 0; j < v.connected.length; j++) {
				let l = document.createElementNS("http://www.w3.org/2000/svg", "line") as SVGLineElement;
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

		this.firstValve = this.valves.find(v => { return v.name === "AA"});
		this.firstValve.setDistance(this.firstValve, 1);
		this.valves.forEach(v => {
			if (v.flow > 0) {
				v.setDistance(v, 1);
			}
		});

		this.valves = this.valves.filter(v => { return v.flow > 0 });

		console.log(...this.valves);

		console.log(this.evaluateN(this.valves.map((v, i) => { return i })));

		this._bestDepth = this.valves.map((v, i) => { return 0 });

		this.recRun([], this.valves.map((v, i) => { return i }));
		console.log("solo run done " + this._bestScore);
		this._bestScore = 0;
		this.recRunWithElephant([], [], this.valves.map((v, i) => { return i }));
		console.log("me + elephant run done " + this._bestScore);
	}

	public recRun(valves: number[], remainingValves: number[]): number {
		if (remainingValves.length === 0) {
			let score = this.evaluateN(valves).score;
			if (score > this._bestScore) {
				this._bestScore = score;
				//console.log(this._bestScore);
			}
			return score;
		}
		else {
			let result = this.evaluateN(valves);
			if (result.n < valves.length) {
				if (result.score > this._bestScore) {
					this._bestScore = result.score;
					//console.log(this._bestScore);
				}
				return result.score;
			}
			else {
				let best = 0;
				for (let i = 0; i < remainingValves.length; i++) {
					let valvesNext = [...valves, remainingValves[i]];
					let remainingValvesNext = remainingValves.filter(v => { return v != remainingValves[i]; });
					let score = this.recRun(valvesNext, remainingValvesNext);
					best = Math.max(best, score);
				}
				return best;
			}
		}
	} 


	public recRunWithElephant(valvesMe: number[], valvesElephant: number[], remainingValves: number[]): number {
		if (remainingValves.length === 0) {
			let score = this.evaluateNWithElephant(valvesMe, valvesElephant).score;
			if (score > this._bestScore) {
				this._bestScore = score;
				//console.log(this._bestScore);
			}
			return score;
		}
		else {
			let result = this.evaluateNWithElephant(valvesMe, valvesElephant);
			if (result.score < this._bestDepth[remainingValves.length] * 0.98) {
				return 0;
			}
			this._bestDepth[remainingValves.length] = Math.max(result.score, this._bestDepth[remainingValves.length]);

			let fullMe = result.nMe < valvesMe.length;
			let fullElephant = result.nElephant < valvesElephant.length
			if (fullMe && fullElephant) {
				if (result.score > this._bestScore) {
					this._bestScore = result.score;
					//console.log(this._bestScore);
				}
				return result.score;
			}
			else {
				let best = 0;
				for (let i = 0; i < remainingValves.length; i++) {
					let score = 0;
					if (!fullMe) {
						let valvesMeNext = [...valvesMe, remainingValves[i]];
						let valvesElephantNext = [...valvesElephant];
						let remainingValvesNext = remainingValves.filter(v => { return v != remainingValves[i]; });
						score = this.recRunWithElephant(valvesMeNext, valvesElephantNext, remainingValvesNext);
					}
					if (!fullElephant) {
						let valvesMeNext = [...valvesMe];
						let valvesElephantNext = [...valvesElephant, remainingValves[i]];
						let remainingValvesNext = remainingValves.filter(v => { return v != remainingValves[i]; });
						score = this.recRunWithElephant(valvesMeNext, valvesElephantNext, remainingValvesNext);
					}
					best = Math.max(best, score);
				}
				return best;
			}
		}
	} 

	public evaluateN(valvesIndexes: number[]): { score: number, n: number } {
		let minute = 0;
		let index = 0;
		let count = 0;
		let score = 0;
		while (minute < 30 && index < valvesIndexes.length) {
			let v = this.valves[valvesIndexes[index]];
			if (v) {
				let prev: Valve;
				if (index > 0) {
					prev = this.valves[valvesIndexes[index - 1]]
				}
				else {
					prev = this.firstValve;
				}
				let d = v.distances.get(prev.name);
				if (minute + d < 30) {
					minute += d;
					//console.log("min " + minute + " open " + v.name + " n = " + index);
					count++;
					score += (30 - minute) * v.flow;
				}
			}
			index++;
		}

		return { score: score, n: count };
	}

	public evaluateNWithElephant(valvesIndexesMe: number[], valvesIndexesElephant: number[]): { score: number, nMe: number, nElephant: number } {
		let minute = 0;
		let countMe = 0;
		let countElephant = 0;
		let score = 0;
		
		let index = 0;
		while (minute < 26 && index < valvesIndexesMe.length) {
			let v = this.valves[valvesIndexesMe[index]];
			if (v) {
				let prev: Valve;
				if (index > 0) {
					prev = this.valves[valvesIndexesMe[index - 1]]
				}
				else {
					prev = this.firstValve;
				}
				let d = v.distances.get(prev.name);
				if (minute + d < 26) {
					minute += d;
					//console.log("min " + minute + " open " + v.name + " n = " + index);
					countMe++;
					score += (26 - minute) * v.flow;
				}
			}
			index++;
		}

		index = 0;
		minute = 0;
		while (minute < 26 && index < valvesIndexesElephant.length) {
			let v = this.valves[valvesIndexesElephant[index]];
			if (v) {
				let prev: Valve;
				if (index > 0) {
					prev = this.valves[valvesIndexesElephant[index - 1]]
				}
				else {
					prev = this.firstValve;
				}
				let d = v.distances.get(prev.name);
				if (minute + d < 26) {
					minute += d;
					//console.log("min " + minute + " open " + v.name + " n = " + index);
					countElephant++;
					score += (26 - minute) * v.flow;
				}
			}
			index++;
		}

		return { score: score, nMe: countMe, nElephant: countElephant };
	}
}

window.addEventListener("load", async () => {
	let main: Main = new Main();
})