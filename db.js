import Database from "better-sqlite3"
import fastifyPlugin from "fastify-plugin";

// not fantastic, but it works

async function dbConnector(fastify, options) {
    var db = new Database("db.sqlite3", {});
    var exists = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='links'").get();
    if (exists["count(*)"] == 0) {
        fastify.log.info("Creating tables");
    } else {
        fastify.log.info("Database connection established");
        var links = db.prepare("SELECT count(*) FROM links").get();
        var users = db.prepare("SELECT count(*) FROM users").get();
        fastify.log.info(`Links: ${links["count(*)"]}, Users: ${users["count(*)"]}`);
    }

    db.prepare("CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, short TEXT, creator INTEGER, visits INTEGER)").run();
    db.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)").run();

    fastify.decorate("db", db);
}

export default fastifyPlugin(dbConnector);