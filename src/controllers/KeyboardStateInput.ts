import Player from './Player';
import ActionType from '../types/ActionType';

type InputKeysMap = {
  left: string;
  right: string;
  up: string;
  down: string;
  shift: string;
  space: string;
};

class KeyboardStateInput {
  private activeKeys: Set<string>;
  private keyMapping: InputKeysMap;
  private movementKeys: string[];
  private player: Player;

  constructor(keyMapping: InputKeysMap, player: Player) {
    this.player = player;
    this.activeKeys = new Set();
    this.keyMapping = keyMapping;
    this.movementKeys = [keyMapping.left, keyMapping.down, keyMapping.up, keyMapping.right];

    this.addKeyboardListeners();
  }

  private addKeyboardListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private isPlayerMoving = (): boolean => {
    return this.movementKeys.some((keyCode) => this.activeKeys.has(keyCode));
  };

  private onKeyDown = (e: WindowEventMap["keydown"]) => {
    const prevState = this.player.getState();
    const keyCode = e.code;
    const activeKeys = this.activeKeys;
    const { shift, space } = this.keyMapping;
    let newState = prevState;
    activeKeys.add(keyCode);

    const isMoving = this.isPlayerMoving();

    if (keyCode === space) {
      newState = ActionType.Dancing;
    } else if (isMoving) {
      newState = activeKeys.has(shift) ? ActionType.Running : ActionType.Walking;
    }

    if (newState !== prevState) {
      this.player.setState(newState);
    }
  };

  private onKeyUp = (e: WindowEventMap["keyup"]) => {
    const prevState = this.player.getState();
    let newState = prevState;
    const keyCode = e.code;
    const activeKeys = this.activeKeys;
    const { shift } = this.keyMapping;

    activeKeys.delete(keyCode);

    const isMoving = this.isPlayerMoving();

    if (keyCode === shift || isMoving) {
      newState = ActionType.Walking;
    } else {
      newState = ActionType.Idle;
    }

    if (newState !== prevState) {
      this.player.setState(newState);
    }
  };
}

export default KeyboardStateInput;
