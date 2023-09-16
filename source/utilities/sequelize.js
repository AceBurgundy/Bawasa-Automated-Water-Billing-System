const { Sequelize } = require("sequelize") 

function customLogger(query, timing) {
    console.log("\n\n------------------");
    console.log("Executing query:", query);
    if (timing !== undefined) {
        console.log("Query execution time:", timing, "ms");
    }
    console.log("------------------\n\n");
}

const db = new Sequelize({
    dialect: 'sqlite',
    storage: './Bawasa.sqlite3',
    define: {
        freezeTableName: true
    },
    logging: false
});

module.exports = { db }