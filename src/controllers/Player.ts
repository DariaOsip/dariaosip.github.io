import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import { AnimationClip } from 'three';
import ActionType from '../types/ActionType';
import Scene from './Scene';
import KeyboardStateInput from './KeyboardStateInput';
import { defaultKeyCodesMap } from '../constants/keysMap';

interface PlayerProps {
  defaultSkin: string;
  animationNames: ActionType[];
  modelNames: string[];
  path: string;
  onLoad: () => void;
}

interface ActionData extends THREE.AnimationAction {
  name: ActionType;
}

class Player extends THREE.Group {
  private action: ActionData;
  private actionList: Record<string, ActionData>;
  private mixer: THREE.AnimationMixer;
  private currentState: ActionType;
  private stateController: KeyboardStateInput;
  private model: THREE.Group;
  private models: Record<string, THREE.Group>;
  private clips: THREE.AnimationClip[];
  public areModelsLoaded: boolean;

  constructor(props: PlayerProps) {
    super();
    this.areModelsLoaded = false;
    this.actionList = {};
    this.clips = [];
    this.currentState = ActionType.Idle;
    this.stateController = new KeyboardStateInput(defaultKeyCodesMap, this);
    this.models = {};

    this.init(props);
  }

  changeAvatar(newSkinName: string) {
    const newModel = this.models[newSkinName];
    if (!newModel) throw new Error("Skin with such name doesn't exist.");
    this.remove(this.model);
    this.initModel(newModel);
    this.initMixer();
    this.clips.forEach(this.setClipToMixer);
    this.action = this.actionList[ActionType.Idle];
    this.action.play();
  }

  private setClipToMixer = (clip: AnimationClip) => {
    const action = this.mixer.clipAction(clip);
    action.name = clip.name;
    this.actionList[clip.name] = action as ActionData;
  };

  getState(): ActionType {
    return this.currentState;
  }

  setState(newState: ActionType) {
    this.currentState = newState;
  }

  private initModel(model: THREE.Group) {
    this.model = model;
    this.add(model);
  }

  private getPositionedModel(model: THREE.Group) {
    model.scale.setScalar(0.1);
    model.traverse((mesh) => {
      mesh.castShadow = true;
    });
    model.position.set(0, 0, 0);
    model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    return model;
  }

  private initMixer() {
    this.mixer = new THREE.AnimationMixer(this.model);
  }

  private onLoad = ({ animationNames, modelNames, onLoad, path }: PlayerProps) => {
    return (model: THREE.Group) => {
      const positionedModel = this.getPositionedModel(model);
      this.initModel(positionedModel);
      this.initMixer();

      const loadingManager = new THREE.LoadingManager();
      const loader = new FBXLoader(loadingManager);
      loader.setPath(path);
      loadingManager.onLoad = () => {
        this.setAction(ActionType.Idle);
        onLoad();
        this.areModelsLoaded = true;
      };

      this.loadAnimations(animationNames, loader);
      this.loadAvatars(modelNames, loader);
    };
  }

  private loadAvatars(modelNames: string[], loader: FBXLoader) {
    modelNames.forEach((name: string) => {
      loader.load(`skins/${name}.fbx`, (model: THREE.Group) => {
        this.models[name] = this.getPositionedModel(model);
      });
    });
  }

  private loadAnimations(animationNames: ActionType[], loader: FBXLoader) {
    animationNames.forEach((name: ActionType) => {
      loader.load(`animations/${name}.fbx`, (model: THREE.Group) => {
        const clip = model.animations[0];
        clip.name = name;
        this.setClipToMixer(clip);
        this.clips.push(clip);
      });
    });
  }

  private handleClickChooseAvatar(modelNames: string[]) {
    modelNames.forEach((name) => {
      const changeAvatarButton = document.getElementById(`change-avatar_${name}`);
      if (changeAvatarButton) {
        changeAvatarButton.onclick = () => this.changeAvatar(name);
      }
    });
  }

  private init(props: PlayerProps) {
    this.handleClickChooseAvatar(props.modelNames);

    const loader = new FBXLoader();
    loader.setPath(props.path);
    loader.load(`skins/${props.defaultSkin}.fbx`, this.onLoad(props), null, (e: ErrorEvent) => console.log(e));
  }

  update = (elapsedTime: number, nextPlayerPosition: THREE.Vector3, isIntersecting: boolean) => {
    if (!this.action) return;
    this.animate(elapsedTime);
    this.move(nextPlayerPosition, isIntersecting);
  };

  private animate = (elapsedTime: number) => {
    this.setAction(this.currentState);
    this.mixer.update(elapsedTime);
  };

  private move = (nextPosition: THREE.Vector3, isIntersecting: boolean) => {
  const angle = Math.PI + Math.atan2(this.position.x - nextPosition.x, this.position.z - nextPosition.z);
    if (!isIntersecting) {
      this.position.copy(nextPosition);
    }
    if (this.model) this.model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
  };

  private setAction(actionType: ActionType) {
    const prevAction = this.action;
    if (prevAction?.name === actionType) return;

    this.action = this.actionList[actionType];

    if (prevAction) {
      this.action.time = 0.1;
      this.action.enabled = true;
      this.action.setEffectiveTimeScale(Scene.timeDilation);
      this.action.setEffectiveWeight(1.0);
      this.action.crossFadeFrom(prevAction, 0.5, true);
    }

    this.action.play();
  }
}

export default Player;
