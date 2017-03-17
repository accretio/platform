// this is the "schema" for Recipes stored in ES

export default class Recipe {
  
  constructor(obj) {
    this.name = obj.name
    this.description = obj.description
    this.steps = []
    this.gallery = obj.gallery
    this.materials = [ "Taulman FDA-approved Nylon" ]

    // let's create a single step here
    if (obj.singleOpenScadFile) {

      this.steps = [ {
        kind: "openscad",
        storage: {
          store: "s3",
          file: obj.singleOpenScadFile
        },
        args: obj.args
      } ]
      
    }
    
  }
  
  toESJson() {
    return({
      name: this.name,
      description: this.description,
      gallery: this.gallery,
      steps: this.steps,
      materials: this.materials
    })

  }
  
}
