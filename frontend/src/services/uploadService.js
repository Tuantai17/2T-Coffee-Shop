import axiosClient from '../api/axiosClient';
import imageCompression from 'browser-image-compression';

const UPLOAD_URL = "/api/catalog/admin/upload/image";

class UploadService {
  async uploadImage(file, folder = 'products') {
    let compressedFile = file;
    if (file.type && file.type.startsWith('image/')) {
      // Banner cần độ phân giải cao để không mất chữ/logo trên ảnh
      // Sản phẩm/category giữ nén nhẹ để tải trang nhanh
      const isBanner = folder === "banners";
      const options = {
            maxSizeMB: 0.2, // Tối đa 200KB
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };

      if (!isBanner) {
        try {
          compressedFile = await imageCompression(file, options);
        } catch (error) {
          console.warn("Không thể nén ảnh, sử dụng ảnh gốc:", error);
        }
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
