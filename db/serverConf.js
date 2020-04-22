var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = {
    name:"conf",
    schema:
    new Schema(
        {
            guildID:{
                type:String,
                required:true,
            },
            prefix: {
                type:String,
                required:true,
            },
            joinRoles:{
                type:Array,
                required:false,
            }
        }),
}



