import { Storage } from "@google-cloud/storage"
import path from "path"
import tmp from "tmp"
import fs from "fs"
import { randomUUID } from "crypto"

;(async () => {
  const credentialPath = path.join(__dirname, "../key.json")
  const credentialText = fs.readFileSync(credentialPath, "utf-8")

  const bucketName = "test-bucket-20230605"
  const fileName = randomUUID() + ".txt"
  const contentToSave = "Hello World!"
  const storage = new Storage({
    credentials: JSON.parse(credentialText),
  })

  console.log("Uploading file...")
  await new Promise<void>((resolve, reject) => {
    tmp.file((err, path, fd, cleanupCallback) => {
      if (err) {
        reject(err)
        return
      }
      ;(async () => {
        try {
          console.log("Tmp file path: " + path)
          fs.writeFileSync(path, contentToSave)
          await storage.bucket(bucketName).upload(path, {
            destination: fileName,
            gzip: true,
          })
          resolve()
        } catch (e) {
          reject(e)
        } finally {
          cleanupCallback()
        }
      })()
    })
  })
  console.log("Downloading file...")
  const buffers = await storage.bucket(bucketName).file(fileName).download()
  const donwloadedText = buffers[0].toString()
  console.log("Upload / Download content match:", donwloadedText === contentToSave)
})()