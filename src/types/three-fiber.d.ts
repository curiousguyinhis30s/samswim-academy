import { Object3DNode } from '@react-three/fiber'
import * as THREE from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Three.js geometry elements
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      group: Object3DNode<THREE.Group, typeof THREE.Group>
      planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>
      sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
      meshBasicMaterial: Object3DNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>

      // Lights
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
      pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>

      // Fog
      fog: Object3DNode<THREE.Fog, typeof THREE.Fog>

      // Custom shader material
      waterMaterial: Object3DNode<THREE.ShaderMaterial, typeof THREE.ShaderMaterial> & {
        transparent?: boolean
      }
    }
  }
}

export {}
