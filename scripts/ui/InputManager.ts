enum KeyInput {
    NULL = -1,
    THRUST_INC = 0,
    THRUST_DEC,
    ROLL_LEFT,
    ROLL_RIGHT
}

class InputManager {

    public keyInputMap: Map<string, KeyInput> = new Map<string, KeyInput>();

    public keyInputDown: UniqueList<KeyInput> = new UniqueList<KeyInput>();

    public keyDownListeners: ((k: KeyInput) => any)[] = [];
    public mappedKeyDownListeners: Map<KeyInput,(() => any)[]> = new Map<KeyInput,(() => any)[]>();
    public keyUpListeners: ((k: KeyInput) => any)[] = [];
    public mappedKeyUpListeners: Map<KeyInput,(() => any)[]> = new Map<KeyInput,(() => any)[]>();

    public initialize(): void {

        
        this.keyInputMap.set("KeyW", KeyInput.THRUST_INC);
        this.keyInputMap.set("KeyA", KeyInput.ROLL_LEFT);
        this.keyInputMap.set("KeyS", KeyInput.THRUST_DEC);
        this.keyInputMap.set("KeyD", KeyInput.ROLL_RIGHT);

        window.addEventListener("keydown", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.push(keyInput);
                for (let i = 0; i < this.keyDownListeners.length; i++) {
                    this.keyDownListeners[i](keyInput);
                }
                let listeners = this.mappedKeyDownListeners.get(keyInput);
                if (listeners) {
                    for (let i = 0; i < listeners.length; i++) {
                        listeners[i]();
                    }
                }
            }
        });
        window.addEventListener("keyup", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.remove(keyInput);
                for (let i = 0; i < this.keyUpListeners.length; i++) {
                    this.keyUpListeners[i](keyInput);
                }
                let listeners = this.mappedKeyUpListeners.get(keyInput);
                if (listeners) {
                    for (let i = 0; i < listeners.length; i++) {
                        listeners[i]();
                    }
                }
            }
        });
    }

    public addKeyDownListener(callback: (k: KeyInput) => any): void {
        this.keyDownListeners.push(callback);
    }

    public addMappedKeyDownListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyDownListeners.set(k, listeners);
        }
    }

    public removeKeyDownListener(callback: (k: KeyInput) => any): void {
        let i = this.keyDownListeners.indexOf(callback);
        if (i != -1) {
            this.keyDownListeners.splice(i, 1);
        }
    }

    public removeMappedKeyDownListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }

    public addKeyUpListener(callback: (k: KeyInput) => any): void {
        this.keyUpListeners.push(callback);
    }

    public addMappedKeyUpListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyUpListeners.set(k, listeners);
        }
    }

    public removeKeyUpListener(callback: (k: KeyInput) => any): void {
        let i = this.keyUpListeners.indexOf(callback);
        if (i != -1) {
            this.keyUpListeners.splice(i, 1);
        }
    }

    public removeMappedKeyUpListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }

    public isKeyInputDown(keyInput: KeyInput): boolean {
        return this.keyInputDown.contains(keyInput);
    }
}