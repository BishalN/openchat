import { createClient } from "@/lib/supabase/client";

export async function uploadFileToSupabase(file: File, bucket: string = "files") {
  const supabase = createClient();

  try {
    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Authentication required");
    }

    // Generate a unique file path with user ID
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`; // Include user ID in path

    // Upload file with presigned URL
    const { data: presignedData, error: presignedError } =
      await supabase.storage.from(bucket).createSignedUploadUrl(filePath);

    if (presignedError) {
      throw new Error(`Failed to get presigned URL: ${presignedError.message}`);
    }

    // Upload using presigned URL
    const { signedUrl } = presignedData;
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file");
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
      size: file.size,
      type: file.type,
      name: file.name,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error instanceof Error ? error : new Error("Failed to upload file");
  }
}
