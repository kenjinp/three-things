import * as THREE from 'three';
import Cloth from './Cloth';
import satisfyConstraints from './satisfyConstraints';
import Wind from 'three-wind';

const MASS = 0.1;
const GRAVITY = 981 * 1.4;
const gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(MASS);
const TIMESTEP = 18 / 1000;
const TIMESTEP_SQ = TIMESTEP * TIMESTEP * TIMESTEP;

export default function simulate(time: number, cloth: Cloth, wind?: Wind) {
  const tempForce = new THREE.Vector3();
  // Aerodynamics forces
  const particles = cloth.particles;
  if (wind) {
    const normal = new THREE.Vector3();
    const indices = cloth.geometry.index;
    const normals = cloth.geometry.attributes.normal;
    for (let i = 0; i < indices.count; i += 3) {
      for (let j = 0; j < 3; j++) {
        const index = indices.getX(i + j);
        normal.fromBufferAttribute(normals as THREE.BufferAttribute, index);
        tempForce
          .copy(normal)
          .normalize()
          .multiplyScalar(normal.dot(wind.windForceVector));
        particles[index].addForce(tempForce);
      }
    }
  }
  particles.forEach(particle => {
    particle.addForce(gravity);
    particle.integrate(TIMESTEP_SQ);
  });

  // Start Constraints
  cloth.constraints.forEach(constraint => {
    satisfyConstraints(constraint[0], constraint[1], constraint[2]);
  });

  // Floor Constraints
  // TODO implement later
  // for (particles = cloth.particles, i = 0, il = particles.length; i < il; i++) {
  //   particle = particles[i];
  //   pos = particle.position;
  //   if (pos.y < -250) {
  //     pos.y = -250;
  //   }
  // }
  // Pin Constraints
  const pins = [0, 1, 2, 3, 4, 5];
  pins.forEach(pin => {
    const xy = pin;
    const p = particles[xy];
    p.position.copy(p.original);
    p.previous.copy(p.original);
  });
}
