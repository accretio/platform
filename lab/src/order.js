// this is the "schema" for Recipes stored in ES

export default class Order {
    
    constructor(obj) {
        this.token = obj.token;
        this.recipe = obj.recipe;
        this.job = obj.job;
    }
    
    toESJson() {
        return({
            token: this.token,
            recipe: this.recipe,
            job: this.job
        });

    }
    
}
