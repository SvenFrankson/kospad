declare class Delaunator {
    public triangles: number[];
    constructor(coords: number[]);
}

class VMath {

    // Method adapted from gre's work (https://github.com/gre/bezier-easing). Thanks !
    public static easeOutElastic(t, b = 0, c = 1, d = 1): number {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * .3;
        }
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    }

    public static easeInOutCirc(x: number): number {
        return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }

    public static easeOutBack(x: number): number {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    public static easeOutQuart(x: number): number {
        return 1 - Math.pow(1 - x, 4);
    }

    public static ProjectPerpendicularAt(v: BABYLON.Vector3, at: BABYLON.Vector3): BABYLON.Vector3 {
        let p: BABYLON.Vector3 = BABYLON.Vector3.Zero();
        let k: number = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    }

    public static Angle(from: BABYLON.Vector3, to: BABYLON.Vector3): number {
        let pFrom: BABYLON.Vector3 = BABYLON.Vector3.Normalize(from);
        let pTo: BABYLON.Vector3 = BABYLON.Vector3.Normalize(to);
        let angle: number = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }

    public static AngleFromToAround(from: BABYLON.Vector3, to: BABYLON.Vector3, around: BABYLON.Vector3, keepPositive?: boolean): number {
        let pFrom: BABYLON.Vector3 = VMath.ProjectPerpendicularAt(from, around).normalize();
        let pTo: BABYLON.Vector3 = VMath.ProjectPerpendicularAt(to, around).normalize();
        let angle: number = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
            if (keepPositive) {
                angle += 2 * Math.PI;
            }
        }
        return angle;
    }

    public static StepAngle(from: number, to: number, step: number): number {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while(from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while(to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }

        if (Math.abs(from - to) <= step) {
            return to;
        }
        if (to < from) {
            step *= - 1;
        }
        if (Math.abs(from - to) > Math.PI) {
            step *= - 1;
        }
        return from + step;
    }

    public static LerpAngle(from: number, to: number, t: number): number {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while(from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while(to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }

        if (Math.abs(from - to) > Math.PI) {
            if (from > Math.PI) {
                from -= 2 * Math.PI;
            }
            else {
                to -= 2 * Math.PI;
            }
        }
        return from * (1 - t) + to * t;
    }

    public static AngularDistance(from: number, to: number): number {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while(from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while(to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }

        let d = Math.abs(from - to);
        if (d > Math.PI) {
            d *= - 1;
        }
        if (to < from) {
            d *= - 1;
        }
        return d;
    }

    public static CatmullRomPath(path: BABYLON.Vector3[]): void {
        let interpolatedPoints: BABYLON.Vector3[] = [];
        for (let i: number = 0; i < path.length; i++) {
            let p0 = path[(i - 1 + path.length) % path.length];
            let p1 = path[i];
            let p2 = path[(i + 1) % path.length];
            let p3 = path[(i + 2) % path.length];
            interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
        }
        for (let i: number = 0; i < interpolatedPoints.length; i++) {
            path.splice(2 * i + 1, 0, interpolatedPoints[i]);
        }
    }

    public static SetABDistance(a: BABYLON.Vector3, b: BABYLON.Vector3, dist: number): BABYLON.Vector3 {
        let n = b.subtract(a);
        n.normalize().scaleInPlace(dist);
        return a.add(n);
    }

    public static SetABDistanceInPlace(a: BABYLON.Vector3, b: BABYLON.Vector3, dist: number, keepAInPlace?: boolean): void {
        let n = b.subtract(a);
        let l = n.length();
        n.normalize();
        if (keepAInPlace) {
            b.copyFrom(n).scaleInPlace(dist).addInPlace(a);
        }
        else {
            let d = (l - dist) * 0.5;
            n.scaleInPlace(d);
            a.addInPlace(n);
            b.subtractInPlace(n);
        }
    }
}
