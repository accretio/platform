export default class Instrument {

    constructor(name, factory) {
        this.name = name;
        this._factory = factory;
    }

    factory() {
	var shape = this._factory();
	shape.instrument = this.name;
	return shape;

    }

    

}
