'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testProductApi = async () => {
    setLoading(true);
    setResult('Loading...');
    
    try {
      const domain = 'efty-1755279491287';
      const productId = '07919e67-478a-4bf7-9a72-af66d9aae1e4';
      
      console.log('Testing API:', `http://localhost:5000/api/products/${domain}/${productId}`);
      
      const response = await fetch(`http://localhost:5000/api/products/${domain}/${productId}`);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        setResult(JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        setResult(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setResult(`Fetch Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testWebsiteApi = async () => {
    setLoading(true);
    setResult('Loading...');
    
    try {
      const domain = 'efty-1755279491287';
      
      console.log('Testing Website API:', `http://localhost:5000/api/websites/public/${domain}`);
      
      const response = await fetch(`http://localhost:5000/api/websites/public/${domain}`);
      console.log('Website Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Website Response data:', data);
        setResult(JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('Website Error response:', errorText);
        setResult(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Website Fetch error:', error);
      setResult(`Fetch Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Testing Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testProductApi}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Test Product API
        </button>
        
        <button 
          onClick={testWebsiteApi}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 ml-4"
        >
          Test Website API
        </button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-2">Result:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {result}
        </pre>
      </div>
    </div>
  );
}
