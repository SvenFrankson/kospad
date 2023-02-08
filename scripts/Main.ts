class Main {

    constructor() {
		let node = new OctreeNode<number>();
		let ii = Math.floor(Math.random() * 16);
		let jj = Math.floor(Math.random() * 16);
		let kk = Math.floor(Math.random() * 16);
		console.log("value = " + node.get(ii, jj, kk));
		node.set(6, ii, jj, kk);
		console.log("value = " + node.get(ii, jj, kk));
	}
}

window.addEventListener("load", async () => {
	let main: Main = new Main();
})