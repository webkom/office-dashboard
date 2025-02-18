import express, { Request, Response } from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import axios from "axios";

const playAudioRouter = express.Router();

// Directory to store temporary MP3 files
const tempDir = path.join(__dirname, "../temp");

const delete_file = (tempFile: string) => {
  fs.unlink(tempFile, (err) => {
    if (err) {
      console.error("Error deleting temporary file:", err);
    } else {
      console.log(`Temporary file deleted: ${tempFile}`);
    }
  });
};

playAudioRouter.get(
  "/play_audio",
  (req: express.Request, res: express.Response): void => {
    try {
      const url =
        "https://www.myinstants.com/media/sounds/john-cena-bing-chilling.mp3";
      axios
        .get(url, { responseType: "arraybuffer" })
        .then((response) => {
          const tempFile = path.join(tempDir, "sound.mp3");
          fs.writeFileSync(tempFile, response.data);

          console.log(`File downloaded: ${tempFile}`);

          // Execute mpg123 and wait for it to finish before deleting the file
          exec(`mpg123 ${tempFile}`, (error) => {
            if (error) {
              console.error("Error playing sound:", error);
            }
            delete_file(tempFile);
          });

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
