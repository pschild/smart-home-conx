import { StationDetailModel } from '@smart-home-conx/api/shared/data-access/models';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class StationDetail implements StationDetailModel {

  @ObjectIdColumn()
  _id: ObjectID;

  @Column({ type: 'timestamp' })
  updatedAt: Date;

  @Column()
  id: string;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column()
  street: string;

  @Column()
  houseNumber: string;

  @Column()
  postCode: number;

  @Column()
  place: string;

  @Column()
  lat: number;

  @Column()
  lng: number;

}