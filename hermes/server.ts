import express from "express";
import playAudioRouter from "./routes/play_audio";

const app = express();
const port = 3001;

// Mount routes
app.use("/", playAudioRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
