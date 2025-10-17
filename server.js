import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let cities = JSON.parse(fs.readFileSync("./data/cities.json", "utf-8"));

app.get("/cities", (req, res) => {
  res.json(cities);
});

app.get("/cities/:id", (req, res) => {
  const city = cities.find((c) => c.id === Number(req.params.id));
  res.json(city);
});

app.post("/cities", (req, res) => {
  const newCity = { id: Date.now(), ...req.body };
  cities.push(newCity);
  fs.writeFileSync("./data/cities.json", JSON.stringify(cities));
  res.json(newCity);
});

app.delete("/cities/:id", (req, res) => {
  cities = cities.filter((c) => c.id !== Number(req.params.id));
  fs.writeFileSync("./data/cities.json", JSON.stringify(cities));
  res.json({ status: "success" });
});

app.listen(9000, () => console.log("Server running on port 9000"));
