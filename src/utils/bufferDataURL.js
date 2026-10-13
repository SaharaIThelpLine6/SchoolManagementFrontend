import { Buffer } from 'buffer';

export const bufferToDataUrl = (buf) => {
  if (buf && buf.type === 'Buffer' && Array.isArray(buf.data) && buf.data.length > 0) {
    return `data:image/png;base64,${Buffer.from(buf.data).toString('base64')}`;
  }
  return null;
};