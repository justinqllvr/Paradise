import * as THREE from 'three';

export default class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
        t *= 2;
		const tx = Math.cos( 2 * Math.PI * t);
		const ty = t * 10 ;
		const tz = Math.sin( 2 * Math.PI * t );

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );

	}

}

