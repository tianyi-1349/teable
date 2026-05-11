declare module '@teamwork/websocket-json-stream' {
  import type { Duplex } from 'node:stream';

  export default class WebSocketJSONStream extends Duplex {
    constructor(ws: unknown);
  }
}
