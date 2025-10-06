import { NextResponse } from "next/server";
import axios from "axios";
import { getValidToken } from "@/lib/auth";
import { uploadThumbnail } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const { template_id, title, description } = await req.json();
    if (!template_id || !title || !description) {
      return NextResponse.json(
        { success: false, error: "template_id, title, description required" },
        { status: 400 }
      );
    }

    const token = await getValidToken();

    console.log("token", token);

    const data = {
      TITLE: { type: "text", text: title },
      DESCRIPTION: { type: "text", text: description },
    };

    const create = await axios.post(
      "https://api.canva.com/rest/v1/autofills",
      { brand_template_id: template_id, data },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const jobId = create.data.job.id;
    let status = "in_progress";
    let attempts = 0;

    while (status === "in_progress" && attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;

      const stat = await axios.get(
        `https://api.canva.com/rest/v1/autofills/${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      status = stat.data.job.status;

      if (status === "success") {
        const designUrl = stat.data.job.result.design.url;
        const thumbnailUrl = stat.data.job.result.design.thumbnail.url;

        try {
          const up = await uploadThumbnail(thumbnailUrl, template_id);
          return NextResponse.json({
            success: true,
            job_id: jobId,
            status: "success",
            design_url: designUrl,
            thumbnail_url: thumbnailUrl,
            cloudinary_url: up.secure_url,
            public_id: up.public_id,
            attempts,
          });
        } catch {
          return NextResponse.json({
            success: true,
            job_id: jobId,
            status: "success",
            design_url: designUrl,
            thumbnail_url: thumbnailUrl,
            cloudinary_url: null,
            attempts,
          });
        }
      }
    }

    return NextResponse.json({
      success: false,
      job_id: jobId,
      status,
      error: "Timeout waiting for job",
      attempts,
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.response?.data || e.message },
      { status: 500 }
    );
  }
}
