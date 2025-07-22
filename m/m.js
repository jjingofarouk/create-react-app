// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7D6kt-SM6EO_rhYW40IWzCM8loomcH5g",
  authDomain: "mymoney-e279e.firebaseapp.com",
  projectId: "mymoney-e279e",
  storageBucket: "mymoney-e279e.firebasestorage.app",
  messagingSenderId: "678343517689",
  appId: "1:678343517689:web:ff17cac1fbf3acedda4928",
  measurementId: "G-P27V8WN70Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateDebtClients = async (userId) => {
  try {
    // Fetch all debts
    const debtsSnapshot = await getDocs(collection(db, `users/${userId}/debts`));
    const clientsSnapshot = await getDocs(collection(db, `users/${userId}/clients`));

    // Create a set of existing client names
    const existingClientNames = new Set(clientsSnapshot.docs.map(doc => doc.data().name));

    // Identify debts with non-existent clients
    const debts = debtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const newClients = new Set();

    // Collect unique client names from debts that don't exist in clients collection
    debts.forEach(debt => {
      if (debt.client && !existingClientNames.has(debt.client)) {
        newClients.add(debt.client);
      }
    });

    // Add missing clients to the clients collection
    for (const clientName of newClients) {
      await addDoc(collection(db, `users/${userId}/clients`), {
        name: clientName.trim(),
        email: null,
        phone: null,
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Added client: ${clientName}`);
    }

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Error during migration:", err);
  }
};

// Run the migration for a specific user
// Replace 'USER_ID' with the actual user ID
migrateDebtClients('USER_ID');