import * as THREE from 'three';

type InputKeysMap = {
  left: string;
  right: string;
  up: string;
  down: string;
  shift?: string;
  space?: string;
};

class KeyboardMoveInput extends THREE.Vector3 {
  private activeKeys: Set<string>;
  private keyMapping: InputKeysMap;

  constructor(keyMapping: InputKeysMap) {
    super();
    this.activeKeys = new Set();
    this.keyMapping = keyMapping;

    this.addKeyboardListeners();
  }

  private addKeyboardListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: WindowEventMap["keydown"]) => {
    const keyCode = e.code;
    const activeKeys = this.activeKeys;
    const { left, right, up, down, space } = this.keyMapping;
    activeKeys.add(keyCode);

    switch (keyCode) {
      case left:
        this.setX(-1);
        break;
      case right:
        this.setX(1);
        break;
      case up:
        this.setY(1);
        break;
      case down:
        this.setY(-1);
        break;
      case space:
        this.setY(0);
        this.setX(0);
        break;
      default:
        break;
    }
  };

  private onKeyUp = (e: WindowEventMap["keyup"]) => {
    const keyCode = e.code;
    const activeKeys = this.activeKeys;
    const { left, right, up, down } = this.keyMapping;

    activeKeys.delete(keyCode);

    switch (keyCode) {
      case left:
        if (!activeKeys.has(right)) this.setX(0);
        break;
      case right:
        if (!activeKeys.has(left)) this.setX(0);
        break;
      case up:
        if (!activeKeys.has(down)) this.setY(0);
        break;
      case down:
        if (!activeKeys.has(up)) this.setY(0);
        break;
      default:
        break;
    }
  };
}

export default KeyboardMoveInput;
