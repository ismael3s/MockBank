export interface IUnitOfWork {
  transaction<T>(work: (transaction) => Promise<T>): Promise<T>;
}
