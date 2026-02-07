import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
const getFirebaseApp = () => {
    if (admin.apps.length === 0) {
        let serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT || '{}';

        // Decode from base64 if needed
        try {
            serviceAccountJson = Buffer.from(serviceAccountJson, 'base64').toString('utf8');
        } catch (e) {
            // If it fails, assume it's already plain JSON
            console.warn('Could not decode FIREBASE_SERVICE_ACCOUNT from base64, treating as plain JSON');
        }

        const serviceAccount = JSON.parse(serviceAccountJson);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    return admin.app();
};

// Get Firestore database instance
export const getFirestore = () => {
    const app = getFirebaseApp();
    return admin.firestore(app);
};

// Type definitions for orders/transactions
export interface Order {
    id: string;
    orderId: string;
    grossAmount: number;
    status: 'pending' | 'paid' | 'failed' | 'cancelled';
    transactionStatus?: string;
    paymentType?: string;
    fraudStatus?: string;
    createdAt: any;
    updatedAt: any;
    [key: string]: any;
}

// Update order status in Firestore
export async function updateOrderStatus(
    orderId: string,
    status: string,
    notificationData: any
): Promise<void> {
    try {
        const db = getFirestore();
        const ordersRef = db.collection('orders');

        // Map Midtrans status codes to our app status
        const statusMap: { [key: string]: string } = {
            '200': 'paid',
            '201': 'pending',
            '202': 'failed',
            '203': 'cancelled',
            '204': 'cancelled',
            '407': 'failed',
            '408': 'failed',
            '409': 'failed',
        };

        const appStatus = statusMap[status] || 'pending';

        const timestamp = admin.firestore.Timestamp.now();

        // Try to update existing order first
        const querySnapshot = await ordersRef.doc(orderId).get();

        if (!querySnapshot.exists) {
            // Create new order if it doesn't exist
            await ordersRef.add({
                orderId,
                status: appStatus,
                transactionStatus: notificationData.transaction_status || status,
                paymentType: notificationData.payment_type,
                fraudStatus: notificationData.fraud_status,
                grossAmount: notificationData.gross_amount || 0,
                createdAt: timestamp,
                updatedAt: timestamp,
                lastNotification: notificationData,
            });

            console.log(`Created new order ${orderId} with status ${appStatus}`);
            return;
        }

        // Update existing order
        await querySnapshot.ref.update({
            status: appStatus,
            transactionStatus: notificationData.transaction_status || status,
            paymentType: notificationData.payment_type,
            fraudStatus: notificationData.fraud_status,
            updatedAt: timestamp,
            lastNotification: notificationData,
        });

        console.log(`Updated order ${orderId} status to ${appStatus}`);
    } catch (error) {
        console.error(`Error updating order ${orderId} in Firestore:`, error);
        throw error;
    }
}

// Get order by ID from Firestore
export async function getOrderByMidtransId(orderId: string): Promise<Order | null> {
    try {
        const db = getFirestore();
        const querySnapshot = await db
            .collection('orders')
            .where('orderId', '==', orderId)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        } as Order;
    } catch (error) {
        console.error(`Error fetching order ${orderId} from Firestore:`, error);
        throw error;
    }
}

// Get all orders from Firestore
export async function getAllOrders(): Promise<Order[]> {
    try {
        const db = getFirestore();
        const querySnapshot = await db.collection('orders').get();

        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        } as Order));
    } catch (error) {
        console.error('Error fetching orders from Firestore:', error);
        throw error;
    }
}
