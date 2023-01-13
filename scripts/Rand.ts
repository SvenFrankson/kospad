class Rand {

    public values: number[] = [];
    public sorted: number[] = [];

    constructor() {
        let L = PIString.length;
        let i = 0;
        while (i + 7 < L) {
            let n = parseInt(PIString.substring(i, i + 7));
            this.values.push(n / 9999999);
            i++;
        }
        this.sorted = this.values.sort((a, b) => { return a - b; });
    }
    
    public test(): void {
        let N = this.sorted.length;
        console.log("count      " + N);
        console.log("1st centi  " + this.sorted[Math.floor(N / 100)]);
        console.log("1st decil  " + this.sorted[Math.floor(N / 10)]);
        console.log("1st quart  " + this.sorted[Math.floor(N / 4)]);
        console.log("median     " + this.sorted[Math.floor(N / 2)]);
        console.log("3rd quart  " + this.sorted[Math.floor(3 * N / 4)]);
        console.log("9th decil  " + this.sorted[Math.floor(9 * N / 10)]);
        console.log("99th centi " + this.sorted[Math.floor(99 * N / 100)]);
    }
}