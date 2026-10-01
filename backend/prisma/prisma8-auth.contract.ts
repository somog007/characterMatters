import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model }) => {
  const User = model('User', {
    fields: {
      id: field.text(),
      email: field.text().unique(),
      passwordHash: field.text(),
      fullName: field.text(),
      role: field.text(),
      status: field.text(),
    },
  });

  return {
    models: {
      User: User.sql({ table: 'users', control: 'observed' }),
    },
  };
});