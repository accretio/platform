// this is the "schema" for Recipes stored in ES

export default class Recipe {
  
  constructor(obj) {
    this.description = obj.description
    this.steps = []

    // let's create a single step here
    if (obj.singleOpenScadFile) {

      this.steps = [ {
        kind: "openscad",
        storage: {
          store: "s3",
          key: obj.singleOpenScadFile.fileKey
        },
        args: obj.args
      } ]
      
    }
    
  }
  
  toESJson() {
    return({
      description: this.description,
      steps: this.steps
    })

  }
  
}
