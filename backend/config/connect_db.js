import Sequelize from "sequelize";

export const sequelize = new Sequelize("trello", "postgres", "189105", {
    host:"localhost",
    port:5432,
    dialect:"postgres"
});

export default async function connection() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log('DB is connected successfuly');
        
    } catch (error) {
        console.log('unable to connect', error);
        throw error;
    }
}