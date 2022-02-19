declare interface Image {
  buffer: Buffer,
  format: string,
  base64(): string,
  blob(): Blob
}

declare interface AccountPicture {
  lowres: Image
  highres: Image
}

export default function (filePath: string): Promise<AccountPicture>;