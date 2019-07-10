import * as THREE from 'three';
import { ClothConfig } from './Cloth';

export function plane(width: number, height: number) {
  return function(u: number, v: number, target: THREE.Vector3) {
    const x = (u - 0.5) * width;
    const y = (v + 0.5) * height;
    const z = 0;
    target.set(x, y, z);
  };
}

export default class Particle {
  position: THREE.Vector3;
  previous: THREE.Vector3;
  original: THREE.Vector3;
  temp: THREE.Vector3[];
  a: THREE.Vector3;
  mass: number;
  invMass: number;
  drag: number;

  constructor(x: number, y: number, z: number, clothConfig: ClothConfig) {
    this.drag = clothConfig.drag;
    this.position = new THREE.Vector3();
    this.previous = new THREE.Vector3();
    this.original = new THREE.Vector3();
    this.a = new THREE.Vector3(0, 0, 0); // acceleration
    this.mass = clothConfig.mass;
    this.invMass = 1 / clothConfig.mass;
    this.temp = [new THREE.Vector3(), new THREE.Vector3()];

    const clothFunction = plane(
      clothConfig.restDistance * clothConfig.segments[0],
      clothConfig.restDistance * clothConfig.segments[1],
    );

    // init
    clothFunction(x, y, this.position); // position
    clothFunction(x, y, this.previous); // previous
    clothFunction(x, y, this.original);
  }

  // Force -> Acceleration
  addForce(force) {
    this.a.add(this.temp[1].copy(force).multiplyScalar(this.invMass));
  }

  // Performs Verlet integration
  integrate(timesq: number) {
    const newPos = this.temp[0].subVectors(this.position, this.previous);
    newPos.multiplyScalar(this.drag).add(this.position);
    newPos.add(this.a.multiplyScalar(timesq));
    this.temp[0] = this.previous;
    this.previous = this.position;
    this.position = newPos;
    this.a.set(0, 0, 0);
  }
}
