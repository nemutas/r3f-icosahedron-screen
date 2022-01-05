import React, { useMemo, useRef, VFC } from 'react';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { extend, useFrame } from '@react-three/fiber';

extend({ ShaderPass })

type CustomPassProps = {
	enabled?: boolean
	lightness?: number
	shift?: number
	noise?: number
}

export const CustomPass: VFC<CustomPassProps> = props => {
	const { enabled = true, lightness = 0.5, shift = 0.3, noise = 0.1 } = props

	const shaderRef = useRef<ShaderPass>(null)

	const shader: THREE.Shader = useMemo(() => {
		return {
			uniforms: {
				tDiffuse: { value: null },
				u_time: { value: 0 },
				u_lightness: { value: 0 },
				u_shift: { value: 0 },
				u_noise: { value: 0 }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		}
	}, [])

	useFrame(() => {
		shaderRef.current!.uniforms.u_time.value += 0.01
	})

	return (
		<shaderPass
			ref={shaderRef}
			attachArray="passes"
			args={[shader]}
			enabled={enabled}
			uniforms-u_lightness-value={lightness}
			uniforms-u_shift-value={shift}
			uniforms-u_noise-value={noise}
		/>
	)
}

const vertexShader = `
varying vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float u_time;
uniform float u_lightness;
uniform float u_shift;
uniform float u_noise;
varying vec2 v_uv;

float hash21(vec2 p) {
	 return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
}

vec3 grayscale(vec4 color) {
  return vec3((color.r + color.g + color.b) / 3.0) * u_lightness;
}

void main() {
	// gray scale
	vec4 t = texture2D(tDiffuse, v_uv);
	vec3 color = grayscale(t);

	// rgb shift
	vec2 shift = vec2(0.01, 0.01) * u_shift;
	vec4 t1 = texture2D(tDiffuse, v_uv + shift);
	vec4 t2 = texture2D(tDiffuse, v_uv - shift);
	vec3 color1 = grayscale(t1);
	vec3 color2 = grayscale(t2);
	color = vec3(color1.r, color.g, color2.b);

	// noise
	float noise = hash21(v_uv + u_time) * u_noise;
 
	gl_FragColor = vec4(color + vec3(noise), 1.0);
}
`
