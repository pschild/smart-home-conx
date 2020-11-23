import { promises as fsPromises } from 'fs';
import { findBinaryForUpdate } from './binary.provider';

test('should return the binary path', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(['esp-foo_v1.0.1.bin']);

  const file = await findBinaryForUpdate('123456', 'esp-foo_v1.0.0.bin');
  expect(file).toMatch(/esp-foo_v1.0.1.bin/);
});

test('should return undefined if chipId folder not found', async () => {
  const file = await findBinaryForUpdate('invalid');
  expect(file).toBe(undefined);
});

test('should return undefined if directory is empty', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue([]);

  const file = await findBinaryForUpdate('123456');
  expect(file).toBe(undefined);
});

test('should return undefined if no binary is found', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(['notes.txt']);

  const file = await findBinaryForUpdate('123456');
  expect(file).toBe(undefined);
});

test('should return undefined if more than one binary is found', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(['esp-foo_v1.0.1.bin', 'esp-foo_v1.0.2.bin']);

  const file = await findBinaryForUpdate('123456');
  expect(file).toBe(undefined);
});

test('should return undefined if no other version is found', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(['esp-foo_v1.0.10.bin']);

  const file = await findBinaryForUpdate('123456', 'esp-foo_v1.0.10.bin');
  expect(file).toBe(undefined);
});
