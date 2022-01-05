import { useControls } from 'leva';
import React, { useEffect, useMemo, VFC } from 'react';
import * as THREE from 'three';
import { Icosahedron, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { publicPath } from '../../utils/path';

export const Icosa: VFC = () => {
	// load textures
	const photoNames = ['landscape', 'landscape2', 'landscape3', 'landscape4']
	const path = (name: string) => publicPath(`/assets/images/${name}.jpg`)
	const textures = useTexture(photoNames.map(name => path(name)))
	textures.forEach(texture => {
		texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping
	})

	// make shader
	const shader: THREE.Shader = useMemo(() => {
		return {
			uniforms: {
				u_texture: { value: textures[0] },
				u_time: { value: 0 }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		}
	}, [textures])

	// controller
	const datas = useControls({
		Photo: { options: photoNames }
	})

	// texture changed
	useEffect(() => {
		switch (datas.Photo) {
			case 'landscape':
				shader.uniforms.u_texture.value = textures[0]
				break
			case 'landscape2':
				shader.uniforms.u_texture.value = textures[1]
				break
			case 'landscape3':
				shader.uniforms.u_texture.value = textures[2]
				break
			case 'landscape4':
				shader.uniforms.u_texture.value = textures[3]
				break
			default:
				shader.uniforms.u_texture.value = textures[0]
		}
	}, [datas.Photo, shader.uniforms.u_texture, textures])

	// frame loop
	useFrame(() => {
		shader.uniforms.u_time.value += 0.01
	})

	return (
		<Icosahedron args={[1, 1]}>
			<shaderMaterial args={[shader]} />
		</Icosahedron>
	)
}

const vertexShader = `
varying vec3 v_normal;
varying vec3 v_eye;
varying vec3 v_mvPos;

void main() {
  v_normal = normalize(normalMatrix * normal);

  vec4 mPos = modelMatrix * vec4(position, 1.0);
	v_eye = normalize(mPos.xyz - cameraPosition);

  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
	v_mvPos = normalize(mvPos.xyz);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform sampler2D u_texture;
uniform float u_time;
varying vec3 v_normal;
varying vec3 v_eye;
varying vec3 v_mvPos;

vec2 hash22( vec2 p ){
	p = vec2( dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
	return fract(sin(p)*43758.5453);
}

float Fresnel(vec3 eyeVector, vec3 worldNormal) {
	return pow(1.0 + dot(eyeVector, worldNormal), 3.0);
}

void main() {
  // frat shading
  vec3 x = dFdx(v_normal);
  vec3 y = dFdy(v_normal);
  vec3 normal = normalize(cross(x, y));

  vec2 uv = gl_FragCoord.xy / vec2(1000.0);

  // uv switcher
  float diffuse = dot(normal, vec3(1.0));
  float periodicity = (sin(u_time) + 1.0) / 2.0;
  vec2 seed = vec2(floor(diffuse * 5.0 + periodicity * 1.5));
  vec2 rand = hash22(seed);
  rand -= 0.5;
  vec2 switcher = sign(rand) * 1.0 + rand * 0.6;
  uv *= switcher;
  
  // refract
  float ior = 1.45;
  vec3 refracted = refract(v_eye, normal, 1.0 / ior);
  uv += refracted.xy * 0.5;

  vec4 t = texture2D(u_texture, uv);

  // fresnel reflect
  float fresnel = Fresnel(v_mvPos, normal);
  vec4 color = mix(t, vec4(1.0), fresnel);

  gl_FragColor = color;
  // gl_FragColor = vec4(vec3(fresnel), 1.0);
  // gl_FragColor = texture2D(u_texture, uv);
  // gl_FragColor = vec4(uuv, 1.0, 1.0);
}
`
