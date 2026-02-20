'use client';
import { useEffect, useState } from 'react';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Email-based login (no password needed!)
  useEffect(() => {
    const loginAndFetch = async () => {
      try {
        // Step 1: Login with EMAIL ONLY
        const loginRes = await fetch('https://lab-inventory-api-production.up.railway.app/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@lab.com'  // Just email, no password!
          })
        });

        if (!loginRes.ok) {
          throw new Error('Login failed');
        }

        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);
        
        const authToken = loginData.access_token;
        
        if (!authToken) {
          throw new Error('No token received');
        }

        // Step 2: Fetch inventory with token
        const inventoryRes = await fetch('https://lab-inventory-api-production.up.railway.app/api/inventory', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!inventoryRes.ok) {
          throw new Error(`Inventory fetch failed: ${inventoryRes.status}`);
        }

        const data = await inventoryRes.json();
        console.log('Inventory Response:', data);
        
        // Backend returns {items: [...]}
        const itemsArray = data.items || [];
        
        console.log('Final items:', itemsArray);
        setItems(itemsArray);
        setLoading(false);
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loginAndFetch();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">🔐 Authenticating and loading inventory...</div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center min-h-screen p-8">
      <div className="text-2xl text-red-600 mb-4">❌ Error</div>
      <div className="text-lg text-gray-700 mb-4">{error}</div>
      <div className="text-sm text-gray-500">Check console (F12) for details</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
          🧪 Lab Inventory Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Total Items</h3>
            <p className="text-4xl font-bold">{items.length}</p>
          </div>
          <div className="p-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Status</h3>
            <p className="text-2xl font-bold">✅ Connected</p>
          </div>
          <div className="p-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold mb-2">Low Stock</h3>
            <p className="text-4xl font-bold">{items.filter(item => item.current_stock <= item.critical_level).length}</p>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Current Stock</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Item Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Unit</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-lg mb-2">✅ Connected to backend!</div>
                      <div>No items in inventory yet. Add some items to get started.</div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{item.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 text-gray-600">{item.category_name || 'Uncategorized'}</td>
                      <td className="px-6 py-4 font-semibold">{item.current_stock}</td>
                      <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                          item.current_stock > item.critical_level ? 'bg-green-100 text-green-800' :
                          item.current_stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.current_stock > item.critical_level ? '✅ In Stock' : 
                           item.current_stock > 0 ? '⚠️ Low Stock' : '❌ Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {items.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Showing all {items.length} items
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
