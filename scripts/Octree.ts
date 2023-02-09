class OctreeNode<T> {

    public size: number;
    public degree: number = 3;
    public parent: OctreeNode<T>;
    public children: any[];

    constructor(parent?: OctreeNode<T>) {
        if (parent) {
            this.parent = parent;
            this.degree = parent.degree - 1;
        }
        this.size = Math.pow(2, this.degree - 1);
    }

    private _getChild(ii: number, jj: number, kk: number): any {
        if (this.children) {
            return this.children[4 * ii + 2 * jj + kk];
        }
    }
    
    private _setChild(child: any, ii: number, jj: number, kk: number): void {
        if (this.children === undefined) {
            this.children = [];
        }
        this.children[4 * ii + 2 * jj + kk] = child;
    }
    
    private _setNthChild(child: any, n: number): void {
        if (this.children === undefined) {
            this.children = [];
        }
        this.children[n] = child;
    }

    public get(i: number, j: number, k: number): T {
        if (!this.children) {
            return undefined;
        }
        let ii = Math.floor(i / this.size) % 2;
        let jj = Math.floor(j / this.size) % 2;
        let kk = Math.floor(k / this.size) % 2;

        let child = this._getChild(ii, jj, kk);
        if (!child) {
            return undefined;
        }
        else if (child instanceof OctreeNode) {
            return child.get(i, j, k);
        }
        else {
            return child as T; 
        }
    }

    public set(v: T, i: number, j: number, k: number): void {
        let ii = Math.floor(i / this.size) % 2;
        let jj = Math.floor(j / this.size) % 2;
        let kk = Math.floor(k / this.size) % 2;

        if (this.degree === 1) {
            this._setChild(v, ii, jj, kk);
        }
        else {
            let childOctree = this._getChild(ii, jj, kk);
            if (!childOctree) {
                childOctree = new OctreeNode<T>(this);
                this._setChild(childOctree, ii, jj, kk);
            }
            childOctree.set(v, i, j, k);
        }
    }

    public serializeToString(): string {
        let output = this.serialize();
        let compressedOutput = output[3] + "#" + output[2] + "#" + output[1];

        let l1 = compressedOutput.length;

        compressedOutput = compressedOutput.replaceAll("________", "H");
        compressedOutput = compressedOutput.replaceAll("_______", "G");
        compressedOutput = compressedOutput.replaceAll("______", "F");
        compressedOutput = compressedOutput.replaceAll("_____", "E");
        compressedOutput = compressedOutput.replaceAll("____", "D");
        compressedOutput = compressedOutput.replaceAll("___", "C");
        compressedOutput = compressedOutput.replaceAll("__", "B");
        //compressedOutput = compressedOutput.replaceAll("_", "A");
        
        compressedOutput = compressedOutput.replaceAll("........", "P");
        compressedOutput = compressedOutput.replaceAll(".......", "O");
        compressedOutput = compressedOutput.replaceAll("......", "N");
        compressedOutput = compressedOutput.replaceAll(".....", "M");
        compressedOutput = compressedOutput.replaceAll("....", "L");
        compressedOutput = compressedOutput.replaceAll("...", "K");
        compressedOutput = compressedOutput.replaceAll("..", "J");
        //compressedOutput = compressedOutput.replaceAll(".", "I");

        let l2 = compressedOutput.length;

        console.log("Compression rate " + ((l2 / l1) * 100).toFixed(0) + "%");

        return compressedOutput;
    }

    public serialize(output?: string[]): string[] {
        if (!output) {
            output = [];
        }
        if (!output[this.degree]) {
            output[this.degree] = "";
        }

        for (let n = 0; n < 8; n++) {
            let child = this.children[n];
            if (child === undefined) {
                output[this.degree] += "_";
            }
            else if (child instanceof OctreeNode) {
                output[this.degree] += ".";
                child.serialize(output);
            }
            else {
                output[this.degree] += child.toString();
            }
        }

        return output;
    }

    public static DeserializeFromString(input: string): OctreeNode<number> {
        let deCompressedInput = input;

        deCompressedInput = deCompressedInput.replaceAll("H", "________");
        deCompressedInput = deCompressedInput.replaceAll("G", "_______");
        deCompressedInput = deCompressedInput.replaceAll("F", "______");
        deCompressedInput = deCompressedInput.replaceAll("E", "_____");
        deCompressedInput = deCompressedInput.replaceAll("D", "____");
        deCompressedInput = deCompressedInput.replaceAll("C", "___");
        deCompressedInput = deCompressedInput.replaceAll("B", "__");
        //deCompressedInput = deCompressedInput.replaceAll("A", "_");
        
        deCompressedInput = deCompressedInput.replaceAll("P", "........");
        deCompressedInput = deCompressedInput.replaceAll("O", ".......");
        deCompressedInput = deCompressedInput.replaceAll("N", "......");
        deCompressedInput = deCompressedInput.replaceAll("M", ".....");
        deCompressedInput = deCompressedInput.replaceAll("L", "....");
        deCompressedInput = deCompressedInput.replaceAll("K", "...");
        deCompressedInput = deCompressedInput.replaceAll("J", "..");
        //deCompressedInput = deCompressedInput.replaceAll("I", ".");

        let split = deCompressedInput.split("#");
        return OctreeNode.Deserialize([undefined, split[2], split[1], split[0]]);
    }

    public static Deserialize(input: string[]): OctreeNode<number> {
        let node = new OctreeNode<number>();
        
        // degree 3
        let inputDeg3 = input[3];
        let degree2Nodes: OctreeNode<number>[] = [];
        let degree1Nodes: OctreeNode<number>[] = [];
        for (let n = 0; n < inputDeg3.length; n++) {
            let c = inputDeg3[n];
            if (c === ".") {
                let newNode = new OctreeNode<number>(node);
                degree2Nodes.push(newNode);
                node._setNthChild(newNode, n);
            }
            else if (c === "_") {

            }
            else {
                let v = parseInt(c);
                node._setNthChild(v, n);
            }
        }

        // degree 2
        for (let m = 0; m < degree2Nodes.length; m++) {
            let nodeDeg2 = degree2Nodes[m];
            let inputDeg2 = input[2].substring(m * 8, (m + 1) * 8);

            for (let n = 0; n < inputDeg2.length; n++) {
                let c = inputDeg2[n];
                if (c === ".") {
                    let newNode = new OctreeNode<number>(nodeDeg2);
                    degree1Nodes.push(newNode);
                    nodeDeg2._setNthChild(newNode, n);
                }
                else if (c === "_") {
    
                }
                else {
                    let v = parseInt(c);
                    nodeDeg2._setNthChild(v, n);
                }
            }
        }

        // degree 1
        for (let m = 0; m < degree1Nodes.length; m++) {
            let nodeDeg1 = degree1Nodes[m];
            let inputDeg1 = input[1].substring(m * 8, (m + 1) * 8);

            for (let n = 0; n < inputDeg1.length; n++) {
                let c = inputDeg1[n];
                if (c === "_") {
    
                }
                else {
                    let v = parseInt(c);
                    nodeDeg1._setNthChild(v, n);
                }
            }
        }

        return node;
    }
}