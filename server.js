import formBodyPlugin from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import fastify from "fastify";
import path from "path";
import fastifyRequestLogger from "@mgcrea/fastify-request-logger";
import db from "./db.js";
import routes from "./routes/index.js";
import fastifyEnv from "@fastify/env";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = fastify({
    logger: {
        level: "debug",
        transport: {
            target: "@mgcrea/pino-pretty-compact",
            options: {
                translateTime: "HH:MM:ss Z",
                colorize: true,
                ignore: "pid,hostname"
            },
        }
    },
    disableRequestLogging: true,

});

app.register(fastifyRequestLogger);
app.register(fastifyEnv, {
    dotenv: true,
    data: process.env,
    schema: {
        type: "object",
        required: ["PASSWORD", "PORT"],
        properties: {
            PASSWORD: {
                type: "string",
            },
            PORT: {
                type: "integer",
                default: 3000
            },
            ROOTREDIRECT: {
                type: "string"
            }
        }
    }
});
await app.after();

app.register(formBodyPlugin);

app.register(db);

app.register(fastifyStatic, {
    root: path.join(__dirname, "uploads"),
    prefix: "/",
    decorateReply: true,
});

app.register(routes, {
    dependencies: ["@fastify/static"]
});

app.listen({port: app.getEnvs().PORT, host: "0.0.0.0"}, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
