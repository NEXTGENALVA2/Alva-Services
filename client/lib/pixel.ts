// Ei file e pixel settings fetch/save korar function thakbe

export async function getPixelSettings() {
  try {
    const res = await fetch('http://localhost:5000/api/pixel');
    return await res.json();
  } catch {
    return { facebookPixel: '', tiktokPixel: '', googleTagManager: '' };
  }
}

export async function savePixelSettings(data: any) {
  try {
    const res = await fetch('http://localhost:5000/api/pixel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}
