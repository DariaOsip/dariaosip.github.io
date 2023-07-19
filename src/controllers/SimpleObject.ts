import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import * as THREE from 'three';
import {Group, Object3D} from 'three';

interface SimpleObjectProps {
  modelName: string;
  path: string;
  onLoad: () => void;
}

class SimpleObject extends THREE.Group {
  public areModelsLoaded: boolean;
  public model: Object3D;

  constructor(props: SimpleObjectProps) {
    super();
    this.areModelsLoaded = false;

    this.init(props);
  }

  private init({ modelName, onLoad, path }: SimpleObjectProps) {
    const loader = new FBXLoader();
    loader.setPath(path);
    loader.load(
      `${modelName}.fbx`,
      (model: Group) => {
        model.scale.setScalar(0.1);

        model.traverse((mesh: THREE.Object3D) => {
          mesh.castShadow = true;
        });

        model.position.set(0, 0, 0);
        model.setRotationFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        this.model = model;
        this.add(model);

        const loadingManager = new THREE.LoadingManager();
        const loader = new FBXLoader(loadingManager);
        loader.setPath(path);

        loadingManager.onLoad = () => {
          this.areModelsLoaded = true;
          onLoad();
        };
      },
      null,
      (e: ErrorEvent) => console.log(e),
    );
  }
}

export default SimpleObject;
