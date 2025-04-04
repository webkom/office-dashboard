import express from "express";
import playAudioRouter from "./routes/play_audio";
import playVoiceRouter from "./routes/play_voice";

const app = express();
const port = 3001;

// Mount routes
app.use("/", playAudioRouter);
app.use("/", playVoiceRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
