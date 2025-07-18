/**
 * Sequelize модель Contact для роботи з PostgreSQL
 * Реалізує структуру таблиці contacts згідно з завданням
 *
 * @fileoverview Sequelize Contact model definition
 * @module Contact
 * @author Andriy Nechyporenko
 * @version 1.0.0
 * @license GPL-3.0
 */

import { DataTypes } from 'sequelize';
import sequelize from '../db/connection.js';

/**
 * Модель Contact з валідацією полів
 * Відповідає вимогам завдання з додатковим полем favorite
 */
const Contact = sequelize.define(
  'contact',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Ім'я не може бути порожнім"
        },
        len: {
          args: [2, 50],
          msg: "Ім'я має містити від 2 до 50 символів"
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Контакт з такою електронною адресою вже існує'
      },
      validate: {
        isEmail: {
          msg: 'Некоректний формат електронної пошти'
        },
        notEmpty: {
          msg: 'Електронна адреса не може бути порожньою'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Номер телефону не може бути порожнім'
        },
        is: {
          args: /^\+[1-9]\d{6,14}$/,
          msg: 'Телефон має бути у міжнародному форматі E.164'
        }
      }
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      validate: {
        isBoolean: {
          msg: 'Поле favorite має бути булевим значенням'
        }
      }
    }
  },
  {
    // Налаштування таблиці
    tableName: 'contacts',
    timestamps: true, // createdAt, updatedAt
    underscored: false, // використовувати camelCase для полів

    // Індекси для оптимізації
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['favorite']
      }
    ]
  }
);

export default Contact;
