import Board_model from "./board_model.js";
import User_m from "./models.js";
import { sequelize } from "../config/connect_db.js";
import coloumn_model from "./column_model.js";
import Card_model from "./card_model.js";
import Label from "./label_model.js";

const Board = Board_model(sequelize);
const Column = coloumn_model(sequelize);
const User = User_m(sequelize);
const Card = Card_model(sequelize);
const label = Label(sequelize);

User.hasMany(Board, { foreignKey: 'userId', onDelete: 'CASCADE' });
Board.belongsTo(User, { foreignKey: 'userId' });

Board.hasMany(Column, { foreignKey: 'boardId', as: 'columns', onDelete: 'CASCADE' });
Column.belongsTo(Board, { foreignKey: 'boardId' });

Column.hasMany(Card, { foreignKey: 'columnId', as: 'cards', onDelete: 'CASCADE' });
Card.belongsTo(Column, { foreignKey: 'columnId' });

Board.hasMany(label, { foreignKey: 'boardId', as: 'labels', onDelete: 'CASCADE' });
label.belongsTo(Board, { foreignKey: 'boardId' });

// Card <-> Label (Many-to-Many)
Card.belongsToMany(label, { through: 'CardLabels', as: 'labels', foreignKey: 'cardId' });
label.belongsToMany(Card, { through: 'CardLabels', as: 'cards', foreignKey: 'labelId' });

export { User, Board , Column ,Card, label};