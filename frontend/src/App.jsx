export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-4">
          Professor Stock Market
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Coming soon... Backend is running on http://localhost:5000
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Status</h2>
          <p className="text-gray-600">Frontend: ✅ Running on port 3000</p>
          <p className="text-gray-600">Backend: 🚀 Check http://localhost:5000/api/health</p>
        </div>
      </div>
    </div>
  );
}
