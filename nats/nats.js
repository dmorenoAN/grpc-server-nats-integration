import nats from "nats";

class NatsWrapper {
  constructor() {
    this._client;
  }

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this._client;
  }

  async connect(url) {
    this._client = await nats.connect({
      servers: url,
    });

    return new Promise((resolve, reject) => {
      console.log(`Connected to ${this._client.getServer()}`);
      resolve(this._client);
    });
  }
}

export const natsWrapper = new NatsWrapper();
