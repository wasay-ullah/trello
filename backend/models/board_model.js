import { DataTypes } from "sequelize";

export default function Board_model(sequelize) {
    return sequelize.define("Board", {

        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },

        title: { type: DataTypes.STRING, allowNull: false ,  },

        description: { type: DataTypes.STRING, allowNull: true }
    }, { timestamps: true });
}
