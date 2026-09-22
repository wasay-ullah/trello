import Sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USER,process.env.DB_PASSWORD, {
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    dialect:"postgres"
});

export default async function connection() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({alter:true});
        console.log('DB is connected successfuly');
        
    } catch (error) {
        console.log('unable to connect', error);
        throw error;
    }
}