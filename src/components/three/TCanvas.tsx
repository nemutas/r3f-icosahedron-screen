import React, { Suspense, VFC } from 'react';
import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Icosa } from './Icosa';
import { Effect } from './postprocessing/Effect';

export const TCanvas: VFC = () => {
	return (
		<Canvas
			camera={{
				position: [0, 0, 3],
				fov: 50,
				aspect: window.innerWidth / window.innerHeight,
				near: 0.1,
				far: 2000
			}}
			dpr={window.devicePixelRatio}
			shadows>
			{/* canvas color */}
			<color attach="background" args={['#000']} />
			{/* camera controller */}
			<OrbitControls attach="orbitControls" />
			{/* helper */}
			<Stats />
			{/* objects */}
			<Suspense fallback={null}>
				<Icosa />
			</Suspense>
			{/* effect */}
			<Effect />
		</Canvas>
	)
}
