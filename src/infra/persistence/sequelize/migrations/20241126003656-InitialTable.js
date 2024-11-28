'use strict';

import { TransactionType } from 'src/domain/entities/bank-account/transaction';

const { Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('customers', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      document: {
        type: Sequelize.STRING(11),
        allowNull: false,
        unique: true,
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
    await queryInterface.createTable('bank_accounts', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      number: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      from_bank_account_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'bank_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      to_bank_account_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'bank_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          TransactionType.Deposit,
          TransactionType.Transfer,
          TransactionType.Withdraw,
        ),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
    });
    await queryInterface.addIndex('bank_accounts', ['number']);
    await queryInterface.addIndex('customers', ['document']);
  },

  async down({ context: queryInterface }) {
    await queryInterface.removeIndex('customers', ['document']);
    await queryInterface.removeIndex('bank_accounts', ['number']);
    await queryInterface.removeColumn('bank_accounts', 'customer_id');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('customers');
    await queryInterface.dropTable('bank_accounts');
  },
};
