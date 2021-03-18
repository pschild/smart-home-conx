import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Esp {

  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  model: string;

  @Column()
  description: string;

  @Column()
  pioEnv: string;

  @Column()
  chipId: number;

}
