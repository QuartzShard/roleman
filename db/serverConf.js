var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const confSchema = new Schema(
    {
        prefix: {
            type:String,
            required:true,
        }
    }
)
module.exports = {
    name:"conf",
    schema:confSchema
}


const testFunc = function() {
    console.log("test")
}
module.exports.testFunc = testFunc