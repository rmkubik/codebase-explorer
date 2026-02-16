import express from "express";
import cors from "cors";
import z, { file } from "zod";
import { listFiles } from "./fileParsing/listFiles";

const app = express();
const port = 3000;

// Adds headers: Access-Control-Allow-Origin: *
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/v1/files/list", async (req, res) => {
  const { filePath } = req.query;

  if (!filePath) {
    res.status(400).send(`filePath is required query param`);
    return;
  }

  if (typeof filePath !== "string") {
    res.status(400).send(`filePath must be string`);
    return;
  }

  const files = await listFiles(filePath);
  res.status(200).send(JSON.stringify(files));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
