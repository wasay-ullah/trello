import { DataTypes } from "sequelize";

export default function Label(sequelize) {
    return sequelize.define("label", {

       id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING(20), // Stores hex or Tailwind color key e.g. '#ef4444'
    allowNull: false,
    defaultValue: '#3b82f6',
  },
}, {
  timestamps: true,
    });
}
