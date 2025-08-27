// Domain settings fetch/save korar function

export async function getDomain() {
  try {
    const res = await fetch('http://localhost:5000/api/domain');
    const data = await res.json();
    return {
      domain: data.domain || '',
      url: data.url || '',
      type: data.type || 'subdomain'
    };
  } catch {
    return { domain: '', url: '', type: 'subdomain' };
  }
}

export async function saveDomain(domain: string) {
  try {
    console.log('Saving domain:', domain); // Debug log
    const res = await fetch('http://localhost:5000/api/domain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain }),
    });
    const data = await res.json();
    console.log('Save response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Save domain error:', error); // Debug log
    return { success: false };
  }
}
