import { uuidv7 } from 'uuidv7';

export abstract class Entity {
  public readonly id: string;

  constructor(id = uuidv7()) {
    this.id = id;
  }
}
