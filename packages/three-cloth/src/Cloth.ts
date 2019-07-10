import * as THREE from 'three';
import Particle, { plane } from './Particle';

export type ClothConfig = {
  mass: number;
  restDistance: number;
  damping: number;
  drag: number;
  segments: number[];
};

const DEFAULT_CONFIG = {
  mass: 0.1,
  restDistance: 1,
  damping: 0.03,
  drag: 1 - 0.03,
  segments: [5, 8],
};

export type Constraint = [Particle, Particle, number];

export default class Cloth extends THREE.Object3D {
  width: number;
  height: number;
  particles: Particle[];
  constraints: Constraint[];
  material: THREE.Material;
  geometry: THREE.ParametricBufferGeometry;
  constructor(clothConfig = DEFAULT_CONFIG, material?: THREE.Material) {
    super();
    this.width = clothConfig.segments[0];
    this.height = clothConfig.segments[1];

    const particles = [];
    const constraints = [];

    // Create particles
    for (let v = 0; v <= this.height; v++) {
      for (let u = 0; u <= this.width; u++) {
        particles.push(
          new Particle(u / this.width, v / this.height, 0, clothConfig),
        );
      }
    }

    // Structural
    for (let v = 0; v < this.height; v++) {
      for (let u = 0; u < this.width; u++) {
        constraints.push([
          particles[this.index(u, v)],
          particles[this.index(u, v + 1)],
          clothConfig.restDistance,
        ]);

        constraints.push([
          particles[this.index(u, v)],
          particles[this.index(u + 1, v)],
          clothConfig.restDistance,
        ]);
      }
    }

    for (let u = this.width, v = 0; v < this.height; v++) {
      constraints.push([
        particles[this.index(u, v)],
        particles[this.index(u, v + 1)],
        clothConfig.restDistance,
      ]);
    }

    for (let v = this.height, u = 0; u < this.width; u++) {
      constraints.push([
        particles[this.index(u, v)],
        particles[this.index(u + 1, v)],
        clothConfig.restDistance,
      ]);
    }

    this.particles = particles;
    this.constraints = constraints;

    const loader = new THREE.TextureLoader();
    const clothTexture = loader.load(
      'https://raw.githubusercontent.com/freddybushboy/unit-cards/master/src/components/CardFlags/assets/ancestry/undead.png',
    );
    clothTexture.flipY = false;

    this.material = new THREE.MeshLambertMaterial({
      map: clothTexture,
      side: THREE.DoubleSide,
      alphaTest: 0.5,
    });
    clothTexture.minFilter = THREE.NearestFilter;
    clothTexture.magFilter = THREE.NearestFilter;

    const clothFunction = plane(
      clothConfig.restDistance * clothConfig.segments[0],
      clothConfig.restDistance * clothConfig.segments[1],
    );

    // cloth geometry
    this.geometry = new THREE.ParametricBufferGeometry(
      clothFunction,
      this.width,
      this.height,
    );

    // cloth mesh
    const clothMesh = new THREE.Mesh(this.geometry, this.material);
    clothMesh.position.set(0, 0, 0);
    clothMesh.castShadow = true;
    this.add(clothMesh);
  }

  index(u: number, v: number) {
    return u + v * (this.width + 1);
  }

  render() {
    this.particles.forEach((particle, index) => {
      const v = particle.position;
      this.geometry.attributes.position.setXYZ(index, v.x, v.y, v.z);
    });
    // this.geometry.attributes.position.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }
}
