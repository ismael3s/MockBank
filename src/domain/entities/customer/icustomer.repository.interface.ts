import { Document } from 'src/domain/vo/document';
import { BankAccount } from '../bank-account/bank-account';
import { Customer } from './customer';

export interface ICustomerRepository {
  existsByDocument(document: Document, transaction?: any): Promise<boolean>;
  create(customer: Customer, transaction?: any): Promise<void>;
  findById(id: string): Promise<Customer | null>;
}
