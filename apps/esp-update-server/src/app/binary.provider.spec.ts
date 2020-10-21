import { promises as fsPromises } from 'fs';
import { findBinaryForUpdate } from './binary.provider';

const mockBinaryNames = [
  'firmware-v10-foobar1.bin',
  'firmware-v1-barf002.bin',
  'firmware-v100-baz4bar.bin',
  'firmware-v42-boo0000.bin',
  'firmware-v20-9876boz.bin'
];

test('should return undefined if chipId not found', async () => {
  const files = await findBinaryForUpdate('invalid');
  expect(files).toBe(undefined);
});

test('should return the binary path', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(['firmware-v1-foobar1.bin']);

  const files = await findBinaryForUpdate('123456');
  expect(files).toMatch(/firmware-v1-foobar1.bin/);
});

test('should return undefined if no newer version available', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(mockBinaryNames);

  const files = await findBinaryForUpdate('123456', 'v100-baz4bar');
  expect(files).toBe(undefined);
});

test('should return latest version if no version given', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(mockBinaryNames);

  const files = await findBinaryForUpdate('123456');
  expect(files).toMatch(/firmware-v100-baz4bar.bin/);
});

test('should return latest version if a newer one is available', async () => {
  spyOn(fsPromises, 'readdir').and.returnValue(mockBinaryNames);

  const files = await findBinaryForUpdate('123456', 'v20-9876boz');
  expect(files).toMatch(/firmware-v100-baz4bar.bin/);
});
