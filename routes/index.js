import { existsSync, readFileSync } from "fs";
import path from "path";

async function routes(fastify, options) {
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
}

export default routes;