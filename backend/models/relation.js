import Board_model from "./board_model.js";
import User_m from "./models.js";
import { sequelize } from "../config/connect_db.js";
import coloumn_model from "./column_model.js";
import Card_model from "./card_model.js";

const Board = Board_model(sequelize);
const Column = coloumn_model(sequelize);
const User = User_m(sequelize);
const Card = Card_model(sequelize);

User.hasMany(Board, { foreignKey: 'userId', onDelete: 'CASCADE' });
Board.belongsTo(User, { foreignKey: 'userId' });

Board.hasMany(Column, { foreignKey: 'boardId', as: 'columns', onDelete: 'CASCADE' });
Column.belongsTo(Board, { foreignKey: 'boardId' });

Column.hasMany(Card, { foreignKey: 'columnId', as: 'cards', onDelete: 'CASCADE' });
Card.belongsTo(Column, { foreignKey: 'columnId' });

export { User, Board , Column ,Card};