import express from "express";
import fs from "fs";
import path from "path";
import axios from "axios";
import playAndDeleteFile from "../audio_file_handler";

const playAudioRouter = express.Router();

playAudioRouter.use(express.json());

playAudioRouter.get(
  "/play_audio",
  (req: express.Request, res: express.Response): void => {
    try {
      const url: string = req.body["url"];

      if (!url) {
        res.status(400).send("URL parameter is required");
        return;
      }

      axios
        .get(url, { responseType: "arraybuffer" })
        .then((response) => {
          const tempFile = path.join(
            path.join(__dirname, "../temp"),
            "sound.mp3",
          );
          fs.writeFileSync(tempFile, response.data);

          console.log(`File downloaded: ${tempFile}`);

          playAndDeleteFile(tempFile);
          res.send("Playing sound!");
        })
        .catch((error) => {
          console.error("Error:", error);
          res.status(500).send("Error playing sound");
        });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error playing sound");
    }
  },
);

export default playAudioRouter;
