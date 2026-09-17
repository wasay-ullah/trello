import { DataTypes } from "sequelize";

export default function User_m(sequelize) {
    return sequelize.define("User", {

        name: { type: DataTypes.STRING, allowNull: false },

        email: { type: DataTypes.STRING, allowNull: false },

        password: { type: DataTypes.STRING, allowNull: false }
    });
}
