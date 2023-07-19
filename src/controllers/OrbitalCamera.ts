import * as THREE from 'three';

class OrbitalCamera extends THREE.Object3D {
    private originalCameraAngle;
    private originalCameraHeight;
    camera: THREE.PerspectiveCamera;

    /**
     * Accepts standard parameters for a THREE.PerspectiveCamera
     */
    constructor(fov: number, aspect: number, near: number, far: number) {
        super();

        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(2, 25, 30);
        this.camera.lookAt(0, 20, 0);
        this.add(this.camera);
        this.originalCameraAngle = this.camera.rotation.x;
        this.originalCameraHeight = this.camera.position.y;
    }

    update(elapsedTime: number, rotation: THREE.Euler) {
        //const pitch = rotation.x * -0.5;
        const yaw = this.rotation.y + rotation.y * -elapsedTime;

        this.rotation.set(this.rotation.x, yaw, this.rotation.z);

        const camAltitude = this.camera.position.clone();
        camAltitude.setY(this.originalCameraHeight + rotation.x * 10);
        this.camera.position.lerp(camAltitude, 0.1);

        const camPitch = this.camera.quaternion.clone();
        camPitch.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.originalCameraAngle - rotation.x * 0.5);
        this.camera.quaternion.slerp(camPitch, 0.1);

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
}

export default OrbitalCamera;
