import * as crypto from 'crypto';

interface IEncryptionOptions {
  algorithm: string;
  key: string | Buffer;
  iv: string | Buffer;
  encoding?: BufferEncoding;
}

const normalizeCipherInput = (
  value: string | Buffer,
  size: number,
  label: 'key' | 'iv'
): Buffer => {
  const source = Buffer.isBuffer(value) ? value : Buffer.from(value);
  if (source.length === size) {
    return source;
  }
  if (source.length > size) {
    return source.subarray(0, size);
  }
  return crypto.createHash('sha256').update(label).update(source).digest().subarray(0, size);
};

export class Encryptor<T> {
  private readonly options: Required<IEncryptionOptions>;

  constructor(options: IEncryptionOptions) {
    this.options = {
      ...options,
      encoding: options.encoding ?? 'hex',
    };
  }

  encrypt(data: T): string {
    try {
      const { algorithm, key, iv, encoding } = this.options;
      const cipherInfo = crypto.getCipherInfo(algorithm);
      if (!cipherInfo?.keyLength || cipherInfo.ivLength == null) {
        throw new Error(`Unsupported cipher algorithm: ${algorithm}`);
      }
      const cipher = crypto.createCipheriv(
        algorithm,
        normalizeCipherInput(key, cipherInfo.keyLength, 'key'),
        normalizeCipherInput(iv, cipherInfo.ivLength, 'iv')
      );
      const encrypted = cipher.update(JSON.stringify(data), 'utf-8', encoding);
      return encrypted + cipher.final(encoding);
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData: string): T {
    try {
      const { algorithm, key, iv, encoding } = this.options;
      const cipherInfo = crypto.getCipherInfo(algorithm);
      if (!cipherInfo?.keyLength || cipherInfo.ivLength == null) {
        throw new Error(`Unsupported cipher algorithm: ${algorithm}`);
      }
      const decipher = crypto.createDecipheriv(
        algorithm,
        normalizeCipherInput(key, cipherInfo.keyLength, 'key'),
        normalizeCipherInput(iv, cipherInfo.ivLength, 'iv')
      );
      const decrypted = decipher.update(encryptedData, encoding, 'utf-8');
      return JSON.parse(decrypted + decipher.final('utf-8')) as T;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
}

export const getEncryptor = <T>(options: IEncryptionOptions) => new Encryptor<T>(options);
