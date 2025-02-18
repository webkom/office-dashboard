import express, { Request, Response } from "express";
import { exec } from "child_process";
import fs from "fs";

const __delete_file__ = (tempFile: string) => {
  fs.unlink(tempFile, (err) => {
    if (err) {
      console.error("Error deleting temporary file:", err);
    } else {
      console.log(`Temporary file deleted: ${tempFile}`);
    }
  });
};

const playAndDeleteFile = (filePath: string) => {
  // Execute mpg123 and wait for it to finish before deleting the file
  exec(`mpg123 ${filePath}`, (error) => {
    if (error) {
      console.error("Error playing sound:", error);
    }
    __delete_file__(filePath);
  });
};

export default playAndDeleteFile;
