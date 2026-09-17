import { DataTypes } from "sequelize";

export default function Coloumn_model(sequelize) {
    return sequelize.define("Column", {

        id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },

        title: { type: DataTypes.STRING, allowNull: false ,  },

       position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
    }, { timestamps: true });
}