import { Faker } from '@faker-js/faker';
import { Role } from '../common/enums';
import { Users } from '../entities/user.entity';
import { setSeederFactory } from 'typeorm-extension';

export const UserFactory = setSeederFactory(Users, (faker: Faker) => {
  const roles = Object.values(Role);

  const user = new Users();

  user.firstName = faker.person.firstName();
  user.lastName = faker.person.lastName();
  user.email = faker.internet.email();
  user.role = Role.USER;
  user.gender = faker.person.sex();
  user.createdAt = faker.date.past();
  user.updatedAt = new Date();

  return user;
});
