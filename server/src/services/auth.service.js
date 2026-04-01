import bcrypt from 'bcryptjs';

export const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, 12);

export const comparePassword = async (plainPassword, hashedPassword) => bcrypt.compare(plainPassword, hashedPassword);
