/**
 * Sequelize модель User для роботи з PostgreSQL
 * Реалізує структуру таблиці users згідно з завданням Topic 7
 *
 * @fileoverview Sequelize User model definition
 * @module User
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

/**
 * Модель User з валідацією полів
 * Відповідає вимогам Topic 7: Authentication and Authorization
 * Topic 9: Додано поле avatarURL для зберігання аватарів
 * Topic 11: Додано поля verify та verificationToken для верифікації email
 */
const User = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password cannot be empty"
        },
        len: {
          args: [6, 100],
          msg: "Password must be between 6 and 100 characters"
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'A user with this email address already exists'
      },
      validate: {
        isEmail: {
          msg: 'Invalid email format'
        },
        notEmpty: {
          msg: 'Email address cannot be empty'
        }
      }
    },
    subscription: {
      type: DataTypes.ENUM,
      values: ["starter", "pro", "business"],
      defaultValue: "starter",
      allowNull: false,
      validate: {
        isIn: {
          args: [["starter", "pro", "business"]],
          msg: 'Subscription must be one of: starter, pro, business'
        }
      }
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true
    },
    avatarURL: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      // НЕ додаємо validate: { isUrl: true }
      // бо поле зберігає як зовнішні URL (Gravatar), так і відносні шляхи (/avatars/xxx.jpg)
    },
    verify: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    }
  },
  {
    // Налаштування таблиці
    tableName: 'users',
    timestamps: true, // createdAt, updatedAt
    underscored: false, // використовувати camelCase для полів

    // Індекси для оптимізації
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['token']
      }
    ]
  }
);

export default User; 