import * as THREE from 'three';
import KeyboardMoveInput from './KeyboardMoveInput';
import Player from './Player';
import ActionType from '../types/ActionType';
import OrbitalCamera from './OrbitalCamera';
import { arrowKeyCodesMap, defaultKeyCodesMap } from '../constants/keysMap';
import SimpleObject from './SimpleObject';

const { innerHeight: viewportHeight, innerWidth: viewportWidth } = window;

type ControlsType = {
  rotation: KeyboardMoveInput;
  position: KeyboardMoveInput;
};

const ACCEPTABLE_DISTANCE = 7;

class Scene extends THREE.Scene {
  private controls: ControlsType;
  private orbital: OrbitalCamera;
  private player: Player;
  private house: SimpleObject;
  private prevTimestamp: number | undefined;
  private renderer;
  private raycaster: THREE.Raycaster;

  static timeDilation = 0.4;

  constructor() {
    super();
    this.prevTimestamp = undefined;
    this.raycaster = new THREE.Raycaster();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.addLights();

    this.player = new Player({
      animationNames: [ActionType.Idle, ActionType.Dancing, ActionType.Walking, ActionType.Running],
      defaultSkin: 'girl',
      modelNames: ['man', 'girl'],
      onLoad: this.onModelLoad,
      path: 'models/player/',
    });
    this.house = new SimpleObject({
      modelName: 'room',
      onLoad: this.onModelLoad,
      path: 'models/house/',
    });
    this.add(this.player);
    this.add(this.house);

    this.controls = {
      position: new KeyboardMoveInput(defaultKeyCodesMap),
      rotation: new KeyboardMoveInput(arrowKeyCodesMap),
    };

    this.orbital = new OrbitalCamera(60, viewportWidth / viewportHeight, 1, 1000);
    this.player.add(this.orbital);

    document.body.appendChild(this.renderer.domElement);
    this.renderer.setAnimationLoop(this.render);
  }

  private isLoading() {
    return this.player.areModelsLoaded && this.house.areModelsLoaded;
  }

  private toggleShowSpinner() {
    const spinner = document.getElementById('loading');
    if (spinner) spinner.classList.toggle("hidden");
  }

  private toggleShowGame() {
    const game = document.getElementById('game');
    if (game) game.classList.toggle("hidden");
  }

  private onModelLoad = () => {
    if (!this.isLoading()) {
      this.toggleShowGame();
      this.toggleShowSpinner();
    }
  };

  private addLights() {
    const directional = new THREE.DirectionalLight(0xffffff, 2);
    directional.position.set(50, 50, 50);
    directional.target.position.set(0, 0, 0);
    directional.castShadow = true;
    this.add(directional);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(ambient);
  }

  private update = (elapsedTime: number) => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Rotate the camera
    const easeIn = 91;
    let { x: yRotation, y: xRotation } = this.controls.rotation;
    xRotation = Math.pow(xRotation, easeIn);
    const cameraRotation = new THREE.Euler(xRotation, yRotation, 0);
    this.orbital.update(elapsedTime, cameraRotation);

    // Reposition the player
    const { x: xPos, y: zPos } = this.controls.position;
    const playerMovement = new THREE.Vector3(xPos, 0, zPos);
    playerMovement.multiplyScalar(Scene.timeDilation);
    // This applies any orbital rotation to the new player position so that the "forward" direction (the A key) will always move the player "up" on the screen (and the same for left, down, and right).
    playerMovement.applyEuler(this.orbital.rotation);
    const playerIsSteady = playerMovement.x === 0 && playerMovement.z === 0;

    const nextPlayerPosition = this.player.position.clone();
    if (!playerIsSteady) {
      nextPlayerPosition.add(playerMovement);
    }

    if (this.house.model) {
      this.raycaster.set(nextPlayerPosition, this.orbital.camera.position);
      const intersectedObjects = this.raycaster.intersectObjects(this.house.children);
      const nearObjects = intersectedObjects.filter((object) => object.distance < ACCEPTABLE_DISTANCE);
      this.player.update(elapsedTime, nextPlayerPosition, !!nearObjects.length);
    }
  };

  render = (timestamp: number) => {
    if (this.prevTimestamp === undefined) {
      this.prevTimestamp = timestamp;
    }

    const elapsedTime = (timestamp - this.prevTimestamp) / 1000;
    this.renderer.render(this, this.orbital.camera);
    this.update(elapsedTime);
    this.prevTimestamp = timestamp;
  };
}

export default Scene;
