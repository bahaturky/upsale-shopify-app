import fs from "fs";
import path, { dirname } from "path";
import Sequelize from "sequelize";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const basename = path.basename(__filename);
const __dirname = dirname(__filename);

const env = process.env.NODE_ENV || "development";
// const config = require(__dirname + "/../config/config.json")[env];
const config = {
    url: "postgresql://doadmin:H7YsBlHr0wZLVVDC@db-postgresql-sfo3-43585-do-user-10776283-0.b.db.ondigitalocean.com:25060/island-upsell?sslmode=no-verify",
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false,
            require: true,
        },
    },
};

const db = {};

export let sequelize;

if (config.hasOwnProperty("url")) {
    sequelize = new Sequelize(config.url, config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );
}

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
        );
    })
    .forEach(async (file) => {
        let model = await import(path.join(__dirname, file));
        model = model.default(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
// export sequelize;
export default db;
