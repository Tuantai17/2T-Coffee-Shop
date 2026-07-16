import axiosClient from '../api/axiosClient';
import imageCompression from 'browser-image-compression';

const UPLOAD_URL = "/api/catalog/admin/upload/image";

class UploadService {
  async uploadImage(file, folder = 'products') {
    let compressedFile = file;
    if (file.type && file.type.startsWith('image/')) {
      // Banner và collection cần độ phân giải cao
      const isHighRes = folder.includes("banner") || folder.includes("collection");
      
      const options = {
        maxSizeMB: isHighRes ? 2 : 0.2, // Tối đa 2MB cho banner, 200KB cho sản phẩm
        maxWidthOrHeight: isHighRes ? 1920 : 1024,
        useWebWorker: true,
      };

      try {
        compressedFile = await imageCompression(file, options);
      } catch (error) {
        console.warn("Không thể nén ảnh, sử dụng ảnh gốc:", error);
      }
    }

    const formData = new FormData();
    formData.append("file", compressedFile);
    if (folder) {
      formData.append("folder", folder);
    }

    try {
      const response = await axiosClient.post(UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (error) {
      console.error("Error uploading image to Cloudinary via backend", error);
      throw error;
    }
  }
}

export default new UploadService();
