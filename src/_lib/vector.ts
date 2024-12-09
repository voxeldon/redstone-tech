class Vector2 {
    static ZERO: Vector2 = new Vector2(0,0);
    constructor(public x: number, public y: number) {}

    static new(obj: { x: number; y: number }): Vector2 {
        return new Vector2(obj.x, obj.y);
    }

    static floor(obj: { x: number; y: number; }): Vector2 {
        return new Vector2(Math.floor(obj.x), Math.floor(obj.y));
    }

    static normalize(obj: { x: number; y: number }): Vector2 {
        const length = Math.sqrt(obj.x * obj.x + obj.y * obj.y);
        if (length === 0) {
            throw new Error("Cannot normalize a vector with length 0");
        }
        return new Vector2(obj.x / length, obj.y / length);
    }
    static add(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x + b.x, a.y + b.y);
    }
    static subtract(a: Vector2, b: Vector2): Vector2 {
        return new Vector2(a.x - b.x, a.y - b.y);
    }
    static multiply(vector: Vector2, divisor: Vector2 | number): Vector2 {
        if (typeof divisor === 'number') {
            return new Vector2(vector.x * divisor, vector.y * divisor);
        } else {
            return new Vector2(vector.x * divisor.x, vector.y * divisor.y);
        }
    }
    static divide(vector: Vector2, divisor: Vector2 | number): Vector2 {
        if (typeof divisor === 'number') {
            return new Vector2(vector.x / divisor, vector.y / divisor);
        } else {
            return new Vector2(vector.x / divisor.x, vector.y / divisor.y);
        }
    }
    static sum(vector: Vector2): number {
        return vector.x + vector.y;
    }
    static distance(a: Vector2, b: Vector2): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Vector3 {
    static ZERO: Vector3 = new Vector3(0,0,0);
    constructor(public x: number, public y: number, public z: number) {}

    static new(obj: { x: number; y: number; z: number }): Vector3 {
        return new Vector3(obj.x, obj.y, obj.z);
    }

    static floor(obj: { x: number; y: number; z: number }): Vector3 {
        return new Vector3(Math.floor(obj.x), Math.floor(obj.y), Math.floor(obj.z));
    }
    
    static normalize(obj: { x: number; y: number; z: number }): Vector3 {
        const length = Math.sqrt(obj.x * obj.x + obj.y * obj.y + obj.z * obj.z);
        if (length === 0) {
            throw new Error("Cannot normalize a vector with length 0");
        }
        return new Vector3(obj.x / length, obj.y / length, obj.z / length);
    }
    static add(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }

    static subtract(a: Vector3, b: Vector3): Vector3 {
        return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
    }
 
    static multiply(vector: Vector3, divisor: Vector3 | number): Vector3 {
        if (typeof divisor === 'number') {
            return new Vector3(vector.x * divisor, vector.y * divisor, vector.z * divisor);
        } else {
            return new Vector3(vector.x * divisor.x, vector.y * divisor.y, vector.z * divisor.z);
        }
    }
    
    static divide(vector: Vector3, divisor: Vector3 | number): Vector3 {
        if (typeof divisor === 'number') {
            return new Vector3(vector.x / divisor, vector.y / divisor, vector.z / divisor);
        } else {
            return new Vector3(vector.x / divisor.x, vector.y / divisor.y, vector.z / divisor.z);
        }
    }

    static sum(vector: Vector3): number {
        return vector.x + vector.y + vector.z;
    }
    
    static distance(a: Vector3, b: Vector3): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    static scale(vector: Vector3, scalar: number): Vector3 {
        return new Vector3(vector.x * scalar, vector.y * scalar, vector.z * scalar);
    }

}

export { Vector2, Vector3 };
