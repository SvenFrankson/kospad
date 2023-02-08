class OctreeNode<T> {

    public size: number;
    public degree: number = 3;
    public parent: OctreeNode<T>;
    public children: any[][][];

    constructor(parent?: OctreeNode<T>) {
        if (parent) {
            this.parent = parent;
            this.degree = parent.degree - 1;
        }
        this.size = Math.pow(2, this.degree);
    }

    private _getChild(ii: number, jj: number, kk: number): any {
        if (this.children) {
            if (this.children[ii]) {
                if (this.children[ii][jj]) {
                    return this.children[ii][jj][kk];
                }
            }
        }
    }
    
    private _setChild(child: any, ii: number, jj: number, kk: number): void {
        if (!this.children) {
            this.children = [];
        }
        if (!this.children[ii]) {
            this.children[ii] = [];
        }
        if (!this.children[ii][jj]) {
            this.children[ii][jj] = [];
        }
        this.children[ii][jj][kk] = child;
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
            let childOctree = new OctreeNode<T>(this);
            this._setChild(childOctree, ii, jj, kk);
            childOctree.set(v, i, j, k);
        }
    }

    public serialize(output: string[]): string {
        for (let ii = 0; ii < 2; ii++) {
            for (let jj = 0; jj < 2; jj++) {
                for (let kk = 0; kk < 2; kk++) {
                    let child = this._getChild(ii, jj, kk);
                    if (!child) {
                        output[this.degree] += "_";
                    }
                    else if (child instanceof OctreeNode) {
                        output[this.degree] += ".";
                    }
                    else {
                        output[this.degree]
                    }
                }
            }
        }
    }
}