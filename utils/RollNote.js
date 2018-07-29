const ROLL = require('Roll.js')

//const geometry = new THREE.PlaneBufferGeometry( 1, 1, 1 )
//const material = new THREE.MeshBasicMaterial( {color: 0x1FB7EC, side: THREE.BackSide} )
//const aiMaterial = new THREE.MeshBasicMaterial( {color: 0xFFB729, side: THREE.BackSide} )

export class RollNote {
	constructor(box, ai){
		//this.element = element
		//const box = this.element.getBoundingClientRect()
		//const initialScaling = 3000
		//this.plane = new THREE.Mesh( geometry, ai ? aiMaterial : material )
		const margin = 4
		//const width = box.width - margin * 2
    this.pos = {}
    this.pos.x = box.left + margin
    this.pos.y = 0
    this.pos.width = box.width - margin * 2
    this.pos.height = 0;
    this.off = false;
    this.ai = ai;
		//this.plane.scale.set(width, initialScaling, 1)
		//this.plane.position.z = 0
		//this.plane.position.x = box.left  + margin + width / 2
		//this.plane.position.y = Roll.bottom + initialScaling / 2
		//this.bottom = Roll.bottom
		ROLL.Roll.add(this)
	}
	noteOff(bottom){
    this.pos.height = this.pos.y
    this.off = true
		//const dist = Roll.bottom - this.bottom
		//this.plane.scale.y = Math.max(dist, 5)
		//this.plane.position.y = this.bottom + this.plane.scale.y / 2
	}
}