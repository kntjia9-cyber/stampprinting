"use server"

import { uploadToCloudinary } from '@/lib/cloudinary'

/**
 * Uploads a file to Cloudinary
 * @param file The file to upload
 * @returns The secure URL of the uploaded file
 */
export async function uploadFile(file: File): Promise<string | null> {
    if (!file || file.size === 0) return null

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary in the 'templates' folder
        const result = await uploadToCloudinary(buffer, 'templates');

        return result.url;
    } catch (error) {
        console.error('Error uploading file to Cloudinary:', error)
        return null
    }
}
