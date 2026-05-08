declare module '@teamwork/websocket-json-stream' {
  import { Duplex } from 'node:stream';

  export default class WebSocketJSONStream extends Duplex {
    constructor(socket: unknown);
  }
}
