// /api/opgg.js
import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  const { name, region } = req.query;

  if (!name || !region) {
    return res.status(400).send("Missing parameters ?name= &region=");
  }

  const url = `https://www.op.gg/summoners/${region}/${name}`;

  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    // Nombre dentro del perfil (ElBlulol#ttv)
    const displayName = $("h1").first().text().trim();

    // Tier / LP
    const tier = $(".tier").first().text().trim();
    const lp = $(".lp").first().text().trim();

    // Wins / Losses / Winrate
    const wins = $(".wins").first().text().replace("W", "").trim();
    const losses = $(".losses").first().text().replace("L", "").trim();
    const wr = $(".winratio").first().text().trim();

    if (!tier) {
      return res.status(404).send("No se pudo encontrar al jugador.");
    }

    const message = `${displayName} – ${region.toUpperCase()} | ${tier} – ${lp} (W: ${wins} | L: ${losses} | WR: ${wr})`;

    return res.status(200).send(message);

  } catch (err) {
    return res.status(500).send("Error interno de servidor.");
  }
}
