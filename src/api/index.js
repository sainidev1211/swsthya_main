import { API_BASE_URL } from './config';
const API_URL = API_BASE_URL;

export const saveUploadRecord = async (uploadData) => {
    try {
        const response = await fetch(`${API_URL}/uploads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(uploadData),
        });

        if (!response.ok) {
            throw new Error(`Error saving upload: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to save upload record", error);
        throw error;
    }
};

export const fetchUserUploads = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/uploads?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`Error fetching uploads: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch user uploads", error);
        throw error;
    }
};

export const saveUserActivity = async (userId, activityType, data) => {
    try {
        const response = await fetch(`${API_URL}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, activityType, data })
        });
        if (!response.ok) throw new Error(`Error saving activity: ${response.statusText}`);
        return await response.json();
    } catch (e) {
        console.error("Failed to save activity", e);
        throw e;
    }
};

export const fetchUserActivities = async (userId, activityType = '') => {
    try {
        let url = `${API_URL}/activities?userId=${userId}`;
        if (activityType) url += `&activityType=${activityType}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error fetching activities: ${response.statusText}`);
        return await response.json();
    } catch (e) {
        console.error("Failed to fetch activities", e);
        throw e;
    }
};
