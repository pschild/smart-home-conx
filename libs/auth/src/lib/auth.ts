import { UnauthorizedError } from './error/unauthorized.error';
import * as jsonwebtoken from 'jsonwebtoken';

export function authErrorHandler(err, req, res, next): any {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: err.message || 'Authorization failed' });
  }
  return res.status(500).json({ message: err.message });
}

export function authenticate(username: string, password: string, sessionLifetime: number): string | undefined {
  if (username === process.env.SERVICE_USER && password === process.env.SERVICE_PASSWORD) {
    const payload = { sub: process.env.SERVICE_USER, foo: 'bar' };
    return jsonwebtoken.sign(payload, process.env.SERVICE_SECRET, { expiresIn: sessionLifetime });
  } else {
    throw new UnauthorizedError();
  }
}
