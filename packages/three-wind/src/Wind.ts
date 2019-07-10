import * as THREE from 'three';

export default class Wind extends THREE.Object3D {
  windForceVector: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  arrowHelper: THREE.ArrowHelper;
  debug: boolean = true;
  constructor() {
    super();
    const origin = new THREE.Vector3(0, 0, 0);
    const dir = new THREE.Vector3(0, 0, 0);
    const length = 1;
    const hex = 0xffff00;
    // normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    this.arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
    this.add(this.arrowHelper);
  }

  windStrength(time: number) {
    return Math.cos(time / 7000) * 20 + 40;
  }

  render(time: number) {
    const strength = this.windStrength(time);
    this.arrowHelper.visible = this.debug;
    this.windForceVector.set(
      Math.sin(time / 2000),
      Math.cos(time / 3000),
      Math.sin(time / 1000),
    );
    this.windForceVector.normalize();
    this.windForceVector.multiplyScalar(strength);
    this.arrowHelper.setDirection(this.windForceVector);
    this.arrowHelper.setLength(strength);
  }
}
