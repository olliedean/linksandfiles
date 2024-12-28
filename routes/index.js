import fastifyPlugin from "fastify-plugin";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { env } from "process";

async function routes(fastify, options) {

    fastify.get("/", async (request, reply) => {
        if(fastify.getEnvs().ROOTREDIRECT != "") {
            reply.redirect(fastify.getEnvs().ROOTREDIRECT);
        } else {
            return {
                message: "project by ollie dean",
                link: "https://ollie.cool/"
            };
        }



    });

    fastify.get("/:link", async (request, reply) => {
        var link = fastify.db.prepare("SELECT * FROM links WHERE short = ?").get(request.params.link);
        if (!link) {
            const __dirname = path.dirname(new URL(import.meta.url).pathname);
            var file = path.join(__dirname, "../uploads", request.params.link);
            if (existsSync(file)) {
                const mimeType = path.extname(file).toLowerCase();
                const contentType = {
                    '.txt': 'text/plain',
                    '.html': 'text/html',
                    '.css': 'text/css',
                    '.js': 'text/javascript',
                    '.json': 'application/json',
                    '.png': 'image/png',
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.gif': 'image/gif',
                    '.mp3': 'audio/mpeg',
                    '.mp4': 'video/mp4',
                    '.pdf': 'application/pdf'
                }[mimeType] || 'application/octet-stream';

                reply.header('Content-Type', contentType);
                reply.send(readFileSync(file));
            } else {
                reply.code(404);
                return { error: "Link not found" };
            }
        } else {
            reply.redirect(link.url);
            fastify.db.prepare("UPDATE links SET visits = visits + 1 WHERE short = ?").run(request.params.link);
        }
    });

    fastify.post("/shorten", async (request, reply) => {
        var auth = request.body.password;
        if(auth != env.PASSWORD) {
            reply.code(401);
            return { error: "Invalid password" };
        }

        var exists = fastify.db.prepare("SELECT * FROM links WHERE short = ?").get(request.body.short);
        if (exists) {
            reply.code(409);
            return { error: "Short link already exists" };
        }
        if(request.body.url == "") {
            reply.code(400);
            return { error: "URL is required" };
        }

        var link = fastify.db.prepare("INSERT INTO links (url, short, creator, visits) VALUES (?, ?, ?, 0)").run(request.body.url, request.body.short, request.body.creator);
        fastify.log.info("Shortened link: " + request.body.short + " -> " + request.body.url);
        return { short: request.body.short };
    });
}

export default routes;