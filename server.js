import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { StringCodec } from "nats";
import { natsWrapper } from "./nats/nats.js";

const PROTO_PATH = "./news.proto";

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const newsProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

let news = {
  news: [
    { id: "1", title: "Note 1", body: "Content 1", postImage: "Post image 1" },
    { id: "2", title: "Note 2", body: "Content 2", postImage: "Post image 2" },
  ],
};

server.addService(newsProto.NewsService.service, {
  getAllNews: (_, callback) => {
    callback(null, news);
  },
});

server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  async (error, port) => {
    const natsServer = await natsWrapper.connect("demo.nats.io:4222");

    console.log(
      "Server running at http://127.0.0.1:50051 and NATS its working :)"
    );

    const sc = StringCodec();
    const sub = natsServer.subscribe("hello");
    (async () => {
      for await (const m of sub) {
        console.log(`[${sub.getProcessed()}]: ${sc.decode(m.data)}`);
      }
      console.log("subscription closed");
    })();

    natsServer.publish("hello", sc.encode("world"));
    natsServer.publish("hello", sc.encode("again"));

    server.start();
  }
);
