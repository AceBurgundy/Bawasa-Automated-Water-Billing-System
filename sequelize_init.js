const { Sequelize } = require("sequelize") 

const db = new Sequelize({
    dialect: 'sqlite',
    storage: './Bawasa.sqlite3',
    define: {
        freezeTableName: true
    }
});

module.exports = { db }