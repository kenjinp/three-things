import * as THREE from 'three';
import Particle from './Particle';

export default function satisfyConstraints(
  p1: Particle,
  p2: Particle,
  distance: number,
) {
  const diff = new THREE.Vector3();
  diff.subVectors(p2.position, p1.position);
  const currentDist = diff.length();
  if (currentDist === 0) return; // prevents division by 0
  const correction = diff.multiplyScalar(1 - distance / currentDist);
  const correctionHalf = correction.multiplyScalar(0.5);
  p1.position.add(correctionHalf);
  p2.position.sub(correctionHalf);
}
