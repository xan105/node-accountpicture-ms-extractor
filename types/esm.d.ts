declare interface Image {
  buffer: Buffer,
  format: string,
  base64(): string
}

export default function (filePath: string): Promise<Image>;