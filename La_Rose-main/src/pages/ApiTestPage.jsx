import { useState } from "react";
import authService from "../services/auth.service";
import bookingService from "../services/booking.service";
import reviewService from "../services/review.service";
import roomService from "../services/room.service";
import statisticalService from "../services/statistical.service";
import userService from "../services/user.service";
import emailService from "../services/email.service";
import transactionService from "../services/transaction.service";
import vnpayService from "../services/vnpay.service";

const ApiTestPage = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async (testFn, testName) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await testFn();
      setResult({ test: testName, success: true, data: res });
    } catch (err) {
      setError({ test: testName, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    {
      category: "Auth Service",
      items: [
        {
          name: "Get Current User",
          fn: () => authService.getCurrentUser(),
        },
        {
          name: "Check Authentication",
          fn: () => authService.isAuthenticated(),
        },
      ],
    },
    {
      category: "Room Service",
      items: [
        {
          name: "Get All Rooms",
          fn: () => roomService.getAllRooms({ page: 1, size: 5 }),
        },
        {
          name: "Get Room Types",
          fn: () => roomService.getRoomTypes(),
        },
      ],
    },
    {
      category: "Statistical Service",
      items: [
        {
          name: "Get Revenue Stats",
          fn: () => statisticalService.getRevenueStats(7),
        },
        {
          name: "Get Total Rooms",
          fn: () => statisticalService.getTotalRooms(),
        },
      ],
    },
    {
      category: "Review Service",
      items: [
        {
          name: "Get All Reviews",
          fn: () => reviewService.getAllReviews({ page: 0, size: 5 }),
        },
      ],
    },
    {
      category: "User Service",
      items: [
        {
          name: "Get All Users",
          fn: () => userService.getAllUsers(),
        },
        {
          name: "Get Active Users",
          fn: () => userService.getActiveUsers(),
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>

      <div className="grid grid-cols-1 gap-6">
        {tests.map((category) => (
          <div key={category.category} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">{category.category}</h2>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((test) => (
                <button
                  key={test.name}
                  onClick={() => handleTest(test.fn, test.name)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {test.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="mt-6 p-4 bg-blue-100 rounded">
          <p className="text-blue-700">Loading...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-100 rounded">
          <h3 className="font-semibold text-red-700">Error: {error.test}</h3>
          <p className="text-red-600">{error.message}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <h3 className="font-semibold text-green-700">
            Success: {result.test}
          </h3>
          <pre className="mt-2 p-2 bg-white rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestPage;
