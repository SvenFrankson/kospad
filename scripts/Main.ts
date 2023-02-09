class Main {

    constructor() {
		let node = new OctreeNode<number>();
		for (let n = 0; n < 1024; n++) {
			let v = Math.floor(Math.random() * 2);
			let i = Math.floor(Math.random() * 8);
			let j = Math.floor(Math.random() * 8);
			let k = Math.floor(Math.random() * 8);
			//node.set(n, n, n, n);
			node.set(v, i, j, k);
		}
		/*
		console.log(node);
		let serial = node.serialize();
		console.log("3: " + serial[3]);
		console.log("2: " + serial[2]);
		console.log("1: " + serial[1]);

		console.log(" ");

		let deserial = OctreeNode.Deserialize(serial);
		let newSerial = deserial.serialize();
		console.log("3: " + newSerial[3]);
		console.log("2: " + newSerial[2]);
		console.log("1: " + newSerial[1]);

		console.log(" ");

		for (let i = 1; i <= 3; i++) {
			console.log(i + ": " + (serial[i] === newSerial[i]));
		}
		*/
		let serial = node.serializeToString();
		console.log(serial);
		let deserial = OctreeNode.DeserializeFromString(serial);
		let newSerial = deserial.serializeToString();
		console.log(newSerial);
		console.log(serial === newSerial);
	}
}

window.addEventListener("load", async () => {
	let main: Main = new Main();
})