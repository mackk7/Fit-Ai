const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('fitai_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function sendChatMessage(messages) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ messages }),
  });
  return handleResponse(res);
}

export async function generateWorkoutPlan(params) {
  const res = await fetch(`${BASE_URL}/api/workout-plan`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function calculateNutrition(params) {
  const res = await fetch(`${BASE_URL}/api/nutrition`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(params),
  });
  return handleResponse(res);
}

export async function getLogs() {
  const res = await fetch(`${BASE_URL}/api/logs`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createLog(logData) {
  const res = await fetch(`${BASE_URL}/api/logs`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(logData),
  });
  return handleResponse(res);
}

export async function updateLog(id, logData) {
  const res = await fetch(`${BASE_URL}/api/logs/${id}`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify(logData),
  });
  return handleResponse(res);
}

export async function deleteLog(id) {
  const res = await fetch(`${BASE_URL}/api/logs/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/api/logs/stats`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getChatHistory() {
  const res = await fetch(`${BASE_URL}/api/chat-history`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function saveChatMessage(role, content) {
  const res = await fetch(`${BASE_URL}/api/chat-history`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ role, content }),
  });
  return handleResponse(res);
}

export async function clearChatHistory() {
  const res = await fetch(`${BASE_URL}/api/chat-history`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getDashboardStats() {
  const res = await fetch(`${BASE_URL}/api/stats/dashboard`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getProgressStats() {
  const res = await fetch(`${BASE_URL}/api/stats/progress`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getGoals() {
  const res = await fetch(`${BASE_URL}/api/goals`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function saveGoals(data) {
  const res = await fetch(`${BASE_URL}/api/goals`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  });
  return handleResponse(res);
}
