import { API_BASE_URL, SOCKET_URL } from '../api/config';
const API_URL = API_BASE_URL;

/**
 * AI Backend System - File Upload & DB Manager
 * Goal: Reliable storage, MongoDB database insertion
 */
export const aiBackendSystem = {
  /**
   * Main entry point for file upload and database save
   */
  async processUserUpload(file, username, password, age) {
    try {
      // 1. Upload File
      const uploadResult = await this.uploadFileWithAutoHealing(file);
      if (!uploadResult.success) {
        return {
          success: false,
          message: uploadResult.message,
          file_url: null,
          db_status: "failed"
        };
      }

      const fileUrl = uploadResult.fileUrl;

      // 2. Insert into Database via API
      const insertResult = await this.saveToDatabaseWithAutoHealing({
        username,
        password,
        age,
        file_url: fileUrl,
        file_name: file.name,
        file_type: file.type
      });

      if (!insertResult.success) {
        return {
          success: false,
          message: insertResult.message,
          file_url: fileUrl,
          db_status: "failed"
        };
      }

      return {
        success: true,
        message: "File stored and user data saved successfully without errors.",
        file_url: fileUrl,
        db_status: "saved"
      };
    } catch (error) {
      console.error("AI System Error:", error);
      return {
        success: false,
        message: "System behavior error: " + error.message,
        file_url: null,
        db_status: "failed"
      };
    }
  },

  /**
   * File Upload Handling (Backend API)
   */
  async uploadFileWithAutoHealing(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/uploads/file`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!data.success) {
        return { success: false, message: data.message };
      }

      const fullUrl = `${SOCKET_URL}${data.data.file_url}`;
      return { success: true, fileUrl: fullUrl };
    } catch (error) {
      console.error("Upload failed:", error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Database Insertion Handling (API Call to MongoDB)
   */
  async saveToDatabaseWithAutoHealing(payload) {
    const fileUrl = payload.file_url;

    if (!fileUrl) {
      console.error("FILE URL MISSING ❌");
      return { success: false, message: "FILE URL MISSING ❌" };
    }

    try {
      // We will hit a special endpoint that finds-or-creates the user based on username 
      // and appends the upload to their array.
      const res = await fetch(`${API_URL}/users/sync-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: payload.username || 'unknown_user',
          password: payload.password || '1234',
          age: payload.age || null,
          uploadData: {
            file_name: payload.file_name || 'unknown_file',
            file_type: payload.file_type || 'unknown',
            file_url: fileUrl,
            ai_result: null // Placeholder for later AI processing
          }
        })
      });

      const data = await res.json();
      if (!data.success) {
         return { success: false, message: data.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: "DB Error: " + error.message };
    }
  },

  /**
   * Retrieval Support
   */
  async fetchUserData() {
    try {
      const storedUserId = localStorage.getItem('swasthya_user_id');
      if (!storedUserId) {
        return { success: false, data: [] };
      }

      const res = await fetch(`${API_URL}/users/${storedUserId}`);
      const data = await res.json();

      if (!data.success) {
        return { success: false, data: [] };
      }

      // To keep compatibility with UI expecting array of users/records
      return { success: true, data: [data.data] };
    } catch (error) {
       console.error("Fetch error:", error);
       return { success: false, data: [] };
    }
  }
};
