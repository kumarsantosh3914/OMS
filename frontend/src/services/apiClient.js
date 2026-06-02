export const API_BASE_URL = 'https://oms-1-voxo.onrender.com';

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const normalizeErrorMessage = async (response) => {
  const text = await response.text();
  if (!text) return response.statusText || 'Request failed';

  try {
    const data = JSON.parse(text);
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg || item.message).filter(Boolean).join(', ');
    }
    return data.message || data.error || text;
  } catch {
    return text.length > 220 ? 'The server returned an unexpected response.' : text;
  }
};

export async function apiRequest(path, options = {}) {
  const config = {
    method: 'GET',
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  };

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, config);
    if (!response.ok) {
      throw new Error(await normalizeErrorMessage(response));
    }

    if (response.status === 204) return null;
    return response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Network request failed. Check your connection and try again.');
    }
    throw error;
  }
}
