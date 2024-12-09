class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static new(obj) {
        return new Vector2(obj.x, obj.y);
    }
    static floor(obj) {
        return new Vector2(Math.floor(obj.x), Math.floor(obj.y));
    }
    static normalize(obj) {
        const length = Math.sqrt(obj.x * obj.x + obj.y * obj.y);
        if (length === 0) {
            throw new Error("Cannot normalize a vector with length 0");
        }
        return new Vector2(obj.x / length, obj.y / length);
    }
    static add(a, b) {
        return new Vector2(a.x + b.x, a.y + b.y);
    }
    static subtract(a, b) {
        return new Vector2(a.x - b.x, a.y - b.y);
    }
    static multiply(vector, divisor) {
        if (typeof divisor === 'number') {
            return new Vector2(vector.x * divisor, vector.y * divisor);
        }
        else {
            return new Vector2(vector.x * divisor.x, vector.y * divisor.y);
        }
    }
    static divide(vector, divisor) {
        if (typeof divisor === 'number') {
            return new Vector2(vector.x / divisor, vector.y / divisor);
        }
        else {
            return new Vector2(vector.x / divisor.x, vector.y / divisor.y);
        }
    }
    static sum(vector) {
        return vector.x + vector.y;
    }
    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
Vector2.ZERO = new Vector2(0, 0);
class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static new(obj) {
        return new Vector3(obj.x, obj.y, obj.z);
    }
    static floor(obj) {
        return new Vector3(Math.floor(obj.x), Math.floor(obj.y), Math.floor(obj.z));
    }
    static normalize(obj) {
        const length = Math.sqrt(obj.x * obj.x + obj.y * obj.y + obj.z * obj.z);
        if (length === 0) {
            throw new Error("Cannot normalize a vector with length 0");
        }
        return new Vector3(obj.x / length, obj.y / length, obj.z / length);
    }
    static add(a, b) {
        return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
    }
    static subtract(a, b) {
        return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
    }
    static multiply(vector, divisor) {
        if (typeof divisor === 'number') {
            return new Vector3(vector.x * divisor, vector.y * divisor, vector.z * divisor);
        }
        else {
            return new Vector3(vector.x * divisor.x, vector.y * divisor.y, vector.z * divisor.z);
        }
    }
    static divide(vector, divisor) {
        if (typeof divisor === 'number') {
            return new Vector3(vector.x / divisor, vector.y / divisor, vector.z / divisor);
        }
        else {
            return new Vector3(vector.x / divisor.x, vector.y / divisor.y, vector.z / divisor.z);
        }
    }
    static sum(vector) {
        return vector.x + vector.y + vector.z;
    }
    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    static scale(vector, scalar) {
        return new Vector3(vector.x * scalar, vector.y * scalar, vector.z * scalar);
    }
}
Vector3.ZERO = new Vector3(0, 0, 0);
export { Vector2, Vector3 };
