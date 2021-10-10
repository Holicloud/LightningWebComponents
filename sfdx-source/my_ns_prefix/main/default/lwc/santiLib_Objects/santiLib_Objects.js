class SantiLib_Objects {
	constructor(objects) {
		this.objects = objects;
	}

	isEmpty() {
		return this.objects == null || !(Object.keys(this.objects) || this.objects).length
	}

	isNotEmpty() {
		return !this.isEmpty();
	}

	getObjects() {
		return this.objects;
	}
}

export {SantiLib_Objects}