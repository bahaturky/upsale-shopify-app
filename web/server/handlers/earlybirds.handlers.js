import fs from "fs";

// When new users install the app from the early offer pages
// We add them to a json file with their free trial length

const add = (req, res) => {
    const { domain, days } = req.body;
    const regex = RegExp(/^[a-z0-9-_]+$/i);
    if (!domain || !regex.test(domain.split(".my")[0])) ctx.throw(404);

    const file = `early-${days === 100 ? 100 : 50}.json`;
    const earlyBirds = JSON.parse(fs.readFileSync(file)) || [];
    const isEarlyBird = earlyBirds.includes(domain);

    if (!isEarlyBird) {
        earlyBirds.push(domain);
        fs.writeFileSync(file, JSON.stringify(earlyBirds));
    }

    // ctx.body = "ok";
    res.send("ok");
};

export default {
    add,
};
