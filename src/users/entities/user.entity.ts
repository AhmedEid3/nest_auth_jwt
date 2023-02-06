import { Role } from 'src/iam/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column({ unique: true })
  name: string;

  @Column()
  password: string;

  @Column('simple-array', { default: Role.User })
  roles: Array<Role>;

  @Column({ nullable: true })
  hashRT: string;
}
