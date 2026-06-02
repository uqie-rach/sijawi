import { compare } from 'bcryptjs';

export const bcrypt = {
  async compare plainText hashedText {
    return await compare(plainText, hashedText);
  },
};