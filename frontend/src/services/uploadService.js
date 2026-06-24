import axiosClient from '../api/axiosClient';

const UPLOAD_URL = "/api/catalog/admin/upload/image";

class UploadService {
  async uploadImage(file, folder = 'products') {
    const formData = new FormData();
    formData.append("file", file);
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
