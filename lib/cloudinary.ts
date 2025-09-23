import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function uploadThumbnail(url: string, templateId: string) {
  return cloudinary.uploader.upload(url, {
    folder: "canva-thumbnails",
    public_id: `thumbnail_${templateId}_${Date.now()}`,
    transformation: [
      { width: 1080, height: 1080, crop: "fit" },
      { quality: "auto" },
    ],
  });
}
