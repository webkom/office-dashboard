/// <reference path="../types.d.ts" />
import express from "express";
import gtts from "node-gtts";
import path from "path";

import playAndDeleteFile from "../audio_file_handler";

const router = express.Router();
const tempDir = path.join(__dirname, "../temp");

router.get(
  "/play_voice",
  (req: express.Request, res: express.Response): void => {
    try {
      // Get language from query parameter, default to English
      const lang: string = req.body["lang"] || "en";
      const text: string = req.body["text"];

      if (!text) {
        res.status(400).send("text parameter is required");
        return;
      }
      const tts = gtts(lang);
      const filepath = path.join(tempDir, "voice.mp3");

      tts.save(filepath, text, () => {
        playAndDeleteFile(filepath);
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error playing voice");
    }
  },
);

export default router;
