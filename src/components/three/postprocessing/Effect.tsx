import { useControls } from 'leva';
import { useEffect, useRef, VFC } from 'react';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { CustomPass } from './CustomPass';

extend({ EffectComposer, RenderPass, ShaderPass })

export const Effect: VFC = () => {
	const datas = useControls('Post-processing', {
		enabled: false,
		lightness: { value: 0.5, min: 0, max: 1, step: 0.01 },
		shift: { value: 0.3, min: 0, max: 1, step: 0.01 },
		noise: { value: 0.1, min: 0, max: 1, step: 0.01 }
	})

	const composerRef = useRef<EffectComposer>(null)
	const { gl, scene, camera, size } = useThree()

	useEffect(() => {
		composerRef.current!.setSize(size.width, size.height)
	}, [size])

	useFrame(() => {
		composerRef.current!.render()
	}, 1)

	return (
		<effectComposer ref={composerRef} args={[gl]}>
			<renderPass attachArray="passes" args={[scene, camera]} />
			<CustomPass {...datas} />
		</effectComposer>
	)
}
