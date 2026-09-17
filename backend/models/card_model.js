import { DataTypes } from "sequelize";

export default function Card_model(sequelize) {
    return sequelize.define("Card", {id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: true,
});
}
