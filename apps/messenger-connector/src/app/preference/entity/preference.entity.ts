import { Column, Entity, ObjectID, ObjectIdColumn, PrimaryColumn } from 'typeorm';

export interface PreferenceModel {
  key: string;
  value: any;
}

@Entity()
export class Preference implements PreferenceModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @PrimaryColumn({ unique: true })
  key: string;

  @Column()
  value: any;

}
