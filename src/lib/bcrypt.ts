import { compare } from 'bcryptjs';

export const bcrypt = {
  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return await compare(plainText, hashedText);
  },
};