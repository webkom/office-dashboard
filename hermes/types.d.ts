declare module "node-gtts" {
  interface GTTS {
    save(filepath: string, text: string, callback: () => void): void;
  }

  function gtts(lang: string): GTTS;
  export = gtts;
}
