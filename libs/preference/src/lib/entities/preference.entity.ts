import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Preference {

  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  name: string;

  @Column()
  value: string;

}
