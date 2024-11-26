import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { IUnitOfWork } from 'src/application/abstractions/iunit-of-work.interface';

@Injectable()
export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly sequelize: Sequelize) {}

  transaction<T>(work: (transaction) => Promise<T>): Promise<T> {
    return this.sequelize.transaction(work);
  }
}
