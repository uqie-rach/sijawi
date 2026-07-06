import { compare, hash } from 'bcryptjs'

export const bcrypt = {
  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return await compare(plainText, hashedText);
  },
  async hash(plainText: string): Promise<string> {
    return await hash(plainText, 10);
  },
};