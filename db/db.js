const fs = require('fs')
const mongoose = require('mongoose')
mongoose.Promise = require('promise')
const { dbUrl } = require("../config.json")

const mongoCon = mongoose.createConnection(dbUrl, {useNewUrlParser:true})
mongoCon.on('error', console.error.bind(console, 'MongoDB connection error:'));
db = new Map()

const modelFiles = fs.readdirSync(`${__dirname}`).filter(file => file.endsWith('.js'));

for (const file of modelFiles) {
    if (file != "db.js") {
        const model = require(`./${file}`);
        db.set(model.name,mongoCon.model(model.name,model.schema))
    }
}

module.exports = db

