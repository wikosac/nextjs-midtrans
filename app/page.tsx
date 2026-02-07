export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Midtrans Payment API</h1>
              <p className="mt-2 text-gray-600">Next.js Integration with Firestore</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12 rounded-lg bg-blue-50 p-8 shadow-sm">
          <p className="mb-4 text-gray-700">
            This is a Next.js application integrated with Midtrans payment gateway and Firebase Firestore for managing transactions.
          </p>
          <p className="text-gray-600">
            Use the REST API below to create transactions, check payment status, and receive payment notifications.
          </p>
        </div>

        {/* API Documentation */}
        <div className="mb-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">REST API Documentation</h2>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            {/* Create Transaction */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">POST</span>
                <code className="text-lg font-mono text-gray-900">/api/transaction</code>
              </div>
              <p className="mb-4 text-gray-600">Create a payment transaction and get a Snap token from Midtrans.</p>

              <div className="mb-4 rounded bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Request Body:</p>
                <pre className="overflow-x-auto text-xs text-gray-800">
                  {`{
  "parameter": {
    "transaction_details": {
      "order_id": "ORDER-123",
      "gross_amount": 100000
    },
    "item_details": [
      {
        "id": "ITEM-1",
        "price": 100000,
        "quantity": 1,
        "name": "Product Name"
      }
    ]
  }
}`}
                </pre>
              </div>

              <div className="rounded bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Response:</p>
                <pre className="overflow-x-auto text-xs text-gray-800">
                  {`{
  "token": "abc123def456..."
}`}
                </pre>
              </div>
            </div>

            {/* Get Transaction Status */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">GET</span>
                <code className="text-lg font-mono text-gray-900">/api/transaction?order_id=ORDER-123</code>
              </div>
              <p className="mb-4 text-gray-600">Check the status of a payment transaction.</p>

              <div className="mb-4 rounded bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Query Parameters:</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li><span className="font-mono">order_id</span> (required) - The Midtrans order ID</li>
                </ul>
              </div>

              <div className="rounded bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Response:</p>
                <pre className="overflow-x-auto text-xs text-gray-800">
                  {`{
  "transaction_id": "abc123",
  "order_id": "ORDER-123",
  "gross_amount": 100000,
  "payment_type": "bank_transfer",
  "transaction_status": "settlement",
  "transaction_time": "2026-02-07 10:00:00"
}`}
                </pre>
              </div>
            </div>

            {/* Notification Webhook */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block rounded bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">POST</span>
                <code className="text-lg font-mono text-gray-900">/api/notification</code>
              </div>
              <p className="mb-4 text-gray-600">Webhook endpoint for Midtrans payment notifications. Automatically updates order status in Firestore.</p>

              <div className="mb-4 rounded bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Status Code Mapping:</p>
                <ul className="text-xs text-gray-800 space-y-1">
                  <li><span className="font-mono">200</span> - settlement (paid)</li>
                  <li><span className="font-mono">201</span> - pending</li>
                  <li><span className="font-mono">202</span> - denied (failed)</li>
                  <li><span className="font-mono">203, 204</span> - cancelled</li>
                  <li><span className="font-mono">407, 408, 409</span> - failed</li>
                </ul>
              </div>

              <div className="rounded bg-gray-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">Firestore Collection:</p>
                <p className="text-xs text-gray-800">Orders are stored in <span className="font-mono">orders</span> collection with fields: orderId, status, transactionStatus, paymentType, fraudStatus, grossAmount, createdAt, updatedAt</p>
              </div>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Required Environment Variables</h3>
          <pre className="overflow-x-auto rounded bg-gray-50 p-4 text-xs text-gray-800">
            {`MIDTRANS_SERVER_KEY=<your-midtrans-server-key>
NEXT_PUBLIC_CLIENT=<your-midtrans-client-key>
FIREBASE_SERVICE_ACCOUNT=<base64-encoded-firebase-service-account>`}
          </pre>
        </div>
      </div>
    </main>
  );
}
