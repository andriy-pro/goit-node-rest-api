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
          msg: "Name cannot be empty"
        },
        len: {
          args: [2, 50],
          msg: "Name must be between 2 and 50 characters"
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'A contact with this email address already exists'
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
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Phone number cannot be empty'
        },
        is: {
          args: /^\+[1-9]\d{6,14}$/,
          msg: 'Phone must be in E.164 international format'
        }
      }
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      validate: {
        isBoolean: {
          msg: 'The favorite field must be a boolean value'
        }
      }
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Owner field is required'
        },
        isInt: {
          msg: 'Owner must be an integer'
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
      },
      {
        fields: ['owner']
      }
    ]
  }
);

// Хук для захисту owner поля від зміни
Contact.beforeUpdate(async (contact) => {
  if (contact.changed('owner')) {
    throw new Error('Owner field cannot be modified');
  }
});

export default Contact;
