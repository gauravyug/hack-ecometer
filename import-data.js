// import-data.js

const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-key.json'); // Path to your downloaded key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 1. Paste the JSON data from ChatGPT here
const dummyData =[
  {
    "category": "food",
    "type": "chicken",
    "amount": 1.25,
    "footprint": 8.62,
    "timestamp": "2024-03-10T14:30:00.123Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "car",
    "amount": 35.80,
    "footprint": 7.16,
    "timestamp": "2024-05-22T08:15:00.456Z",
    "userId": "user_bob"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 55.00,
    "footprint": 16.50,
    "timestamp": "2024-02-18T19:00:00.789Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 0.80,
    "footprint": 21.60,
    "timestamp": "2024-04-05T12:00:00.000Z",
    "userId": "user_frank"
  },
  {
    "category": "travel",
    "type": "train",
    "amount": 120.50,
    "footprint": 1.21,
    "timestamp": "2024-01-28T10:45:00.111Z",
    "userId": "user_grace"
  },
  {
    "category": "shopping",
    "type": "clothing",
    "amount": 3.00,
    "footprint": 15.00,
    "timestamp": "2024-03-15T16:00:00.222Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "vegetables",
    "amount": 1.80,
    "footprint": 3.60,
    "timestamp": "2024-04-12T09:30:00.333Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "flight_short_haul",
    "amount": 350.00,
    "footprint": 52.50,
    "timestamp": "2024-06-01T11:00:00.444Z",
    "userId": "user_bob"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 80.00,
    "footprint": 16.00,
    "timestamp": "2024-02-01T20:00:00.555Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "pork",
    "amount": 1.50,
    "footprint": 18.15,
    "timestamp": "2024-05-01T13:00:00.666Z",
    "userId": "user_alice"
  },
  {
    "category": "shopping",
    "type": "electronics",
    "amount": 1.00,
    "footprint": 50.00,
    "timestamp": "2024-04-20T17:00:00.777Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 0.60,
    "footprint": 16.20,
    "timestamp": "2024-03-01T18:00:00.888Z",
    "userId": "user_frank"
  },
  {
    "category": "travel",
    "type": "bus",
    "amount": 25.00,
    "footprint": 1.25,
    "timestamp": "2024-05-10T07:45:00.999Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "chicken",
    "amount": 2.10,
    "footprint": 14.49,
    "timestamp": "2024-02-28T11:30:00.010Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "car",
    "amount": 60.50,
    "footprint": 12.10,
    "timestamp": "2024-06-15T09:00:00.020Z",
    "userId": "user_bob"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 70.00,
    "footprint": 21.00,
    "timestamp": "2024-03-20T19:30:00.030Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "dairy_milk",
    "amount": 3.00,
    "footprint": 6.30,
    "timestamp": "2024-04-18T08:00:00.040Z",
    "userId": "user_alice"
  },
  {
    "category": "shopping",
    "type": "household_goods",
    "amount": 2.00,
    "footprint": 20.00,
    "timestamp": "2024-05-05T14:00:00.050Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 1.10,
    "footprint": 29.70,
    "timestamp": "2024-02-10T12:00:00.060Z",
    "userId": "user_frank"
  },
  {
    "category": "travel",
    "type": "flight_long_haul",
    "amount": 3500.00,
    "footprint": 875.00,
    "timestamp": "2024-01-20T10:00:00.070Z",
    "userId": "user_bob"
  },
  {
    "category": "food",
    "type": "vegetables",
    "amount": 2.50,
    "footprint": 5.00,
    "timestamp": "2024-03-25T13:45:00.080Z",
    "userId": "user_eve"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 100.00,
    "footprint": 20.00,
    "timestamp": "2024-04-01T21:00:00.090Z",
    "userId": "user_charlie"
  },
  {
    "category": "travel",
    "type": "train",
    "amount": 85.00,
    "footprint": 0.85,
    "timestamp": "2024-06-05T11:00:00.100Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "eggs",
    "amount": 1.00,
    "footprint": 4.50,
    "timestamp": "2024-05-28T07:00:00.110Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "car",
    "amount": 20.00,
    "footprint": 4.00,
    "timestamp": "2024-04-02T16:00:00.120Z",
    "userId": "user_bob"
  },
  {
    "category": "shopping",
    "type": "clothing",
    "amount": 1.00,
    "footprint": 5.00,
    "timestamp": "2024-03-08T10:00:00.130Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 0.90,
    "footprint": 24.30,
    "timestamp": "2024-05-18T19:00:00.140Z",
    "userId": "user_frank"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 60.00,
    "footprint": 18.00,
    "timestamp": "2024-01-25T22:00:00.150Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "chicken",
    "amount": 1.80,
    "footprint": 12.42,
    "timestamp": "2024-06-10T14:00:00.160Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "bus",
    "amount": 40.00,
    "footprint": 2.00,
    "timestamp": "2024-02-15T08:30:00.170Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "dairy_milk",
    "amount": 2.00,
    "footprint": 4.20,
    "timestamp": "2024-04-25T11:00:00.180Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "flight_short_haul",
    "amount": 200.00,
    "footprint": 30.00,
    "timestamp": "2024-03-05T15:00:00.190Z",
    "userId": "user_bob"
  },
  {
    "category": "shopping",
    "type": "electronics",
    "amount": 1.00,
    "footprint": 50.00,
    "timestamp": "2024-06-08T17:00:00.200Z",
    "userId": "user_diana"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 120.00,
    "footprint": 24.00,
    "timestamp": "2024-02-20T20:30:00.210Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "pork",
    "amount": 0.80,
    "footprint": 9.68,
    "timestamp": "2024-05-12T13:00:00.220Z",
    "userId": "user_eve"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 1.30,
    "footprint": 35.10,
    "timestamp": "2024-04-10T12:00:00.230Z",
    "userId": "user_frank"
  },
  {
    "category": "travel",
    "type": "train",
    "amount": 180.00,
    "footprint": 1.80,
    "timestamp": "2024-01-15T09:00:00.240Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "chicken",
    "amount": 1.00,
    "footprint": 6.90,
    "timestamp": "2024-03-02T14:30:00.250Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "car",
    "amount": 75.00,
    "footprint": 15.00,
    "timestamp": "2024-05-15T08:00:00.260Z",
    "userId": "user_bob"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 90.00,
    "footprint": 27.00,
    "timestamp": "2024-02-25T19:00:00.270Z",
    "userId": "user_charlie"
  },
  {
    "category": "shopping",
    "type": "clothing",
    "amount": 2.00,
    "footprint": 10.00,
    "timestamp": "2024-04-08T16:00:00.280Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 0.70,
    "footprint": 18.90,
    "timestamp": "2024-06-01T12:00:00.290Z",
    "userId": "user_frank"
  },
  {
    "category": "travel",
    "type": "bus",
    "amount": 30.00,
    "footprint": 1.50,
    "timestamp": "2024-03-18T07:30:00.300Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "vegetables",
    "amount": 3.00,
    "footprint": 6.00,
    "timestamp": "2024-05-08T09:45:00.310Z",
    "userId": "user_eve"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 70.00,
    "footprint": 14.00,
    "timestamp": "2024-01-30T21:00:00.320Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "dairy_milk",
    "amount": 4.00,
    "footprint": 8.40,
    "timestamp": "2024-06-18T08:00:00.330Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "flight_long_haul",
    "amount": 5000.00,
    "footprint": 1250.00,
    "timestamp": "2024-04-15T10:00:00.340Z",
    "userId": "user_bob"
  },
  {
    "category": "shopping",
    "type": "household_goods",
    "amount": 1.00,
    "footprint": 10.00,
    "timestamp": "2024-05-20T14:00:00.350Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "eggs",
    "amount": 1.50,
    "footprint": 6.75,
    "timestamp": "2024-03-12T07:00:00.360Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "train",
    "amount": 60.00,
    "footprint": 0.60,
    "timestamp": "2024-02-05T11:00:00.370Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "chicken",
    "amount": 2.50,
    "footprint": 17.25,
    "timestamp": "2024-04-01T14:00:00.380Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "car",
    "amount": 45.00,
    "footprint": 9.00,
    "timestamp": "2024-06-12T08:30:00.390Z",
    "userId": "user_bob"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 85.00,
    "footprint": 25.50,
    "timestamp": "2024-03-01T19:30:00.400Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 1.00,
    "footprint": 27.00,
    "timestamp": "2024-05-25T18:00:00.410Z",
    "userId": "user_frank"
  },
  {
    "category": "shopping",
    "type": "clothing",
    "amount": 4.00,
    "footprint": 20.00,
    "timestamp": "2024-02-18T10:00:00.420Z",
    "userId": "user_diana"
  },
  {
    "category": "travel",
    "type": "bus",
    "amount": 50.00,
    "footprint": 2.50,
    "timestamp": "2024-04-28T07:00:00.430Z",
    "userId": "user_grace"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 150.00,
    "footprint": 30.00,
    "timestamp": "2024-03-10T20:00:00.440Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "pork",
    "amount": 1.20,
    "footprint": 14.52,
    "timestamp": "2024-06-05T13:00:00.450Z",
    "userId": "user_eve"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 0.50,
    "footprint": 13.50,
    "timestamp": "2024-04-22T12:00:00.460Z",
    "userId": "user_frank"
  },
  {
    "category": "travel",
    "type": "flight_short_haul",
    "amount": 400.00,
    "footprint": 60.00,
    "timestamp": "2024-05-03T11:00:00.470Z",
    "userId": "user_bob"
  },
  {
    "category": "food",
    "type": "vegetables",
    "amount": 1.50,
    "footprint": 3.00,
    "timestamp": "2024-03-08T09:00:00.480Z",
    "userId": "user_alice"
  },
  {
    "category": "shopping",
    "type": "electronics",
    "amount": 1.00,
    "footprint": 50.00,
    "timestamp": "2024-06-20T17:00:00.490Z",
    "userId": "user_diana"
  },
  {
    "category": "travel",
    "type": "train",
    "amount": 150.00,
    "footprint": 1.50,
    "timestamp": "2024-02-10T09:00:00.500Z",
    "userId": "user_grace"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 100.00,
    "footprint": 30.00,
    "timestamp": "2024-04-10T19:00:00.510Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "chicken",
    "amount": 1.70,
    "footprint": 11.73,
    "timestamp": "2024-05-01T14:30:00.520Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "car",
    "amount": 90.00,
    "footprint": 18.00,
    "timestamp": "2024-03-28T08:15:00.530Z",
    "userId": "user_bob"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 1.40,
    "footprint": 37.80,
    "timestamp": "2024-06-10T12:00:00.540Z",
    "userId": "user_frank"
  },
  {
    "category": "shopping",
    "type": "clothing",
    "amount": 2.00,
    "footprint": 10.00,
    "timestamp": "2024-04-20T16:00:00.550Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "dairy_milk",
    "amount": 2.50,
    "footprint": 5.25,
    "timestamp": "2024-02-22T08:00:00.560Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "bus",
    "amount": 35.00,
    "footprint": 1.75,
    "timestamp": "2024-05-18T07:45:00.570Z",
    "userId": "user_grace"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 90.00,
    "footprint": 18.00,
    "timestamp": "2024-01-10T20:30:00.580Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "vegetables",
    "amount": 2.00,
    "footprint": 4.00,
    "timestamp": "2024-06-02T09:30:00.590Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "flight_long_haul",
    "amount": 2800.00,
    "footprint": 700.00,
    "timestamp": "2024-02-01T10:00:00.600Z",
    "userId": "user_bob"
  },
  {
    "category": "food",
    "type": "pork",
    "amount": 1.00,
    "footprint": 12.10,
    "timestamp": "2024-04-05T13:00:00.610Z",
    "userId": "user_alice"
  },
  {
    "category": "shopping",
    "type": "household_goods",
    "amount": 3.00,
    "footprint": 30.00,
    "timestamp": "2024-03-05T14:00:00.620Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 1.20,
    "footprint": 32.40,
    "timestamp": "2024-05-08T12:00:00.630Z",
    "userId": "user_frank"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 110.00,
    "footprint": 33.00,
    "timestamp": "2024-02-05T19:00:00.640Z",
    "userId": "user_charlie"
  },
  {
    "category": "travel",
    "type": "train",
    "amount": 100.00,
    "footprint": 1.00,
    "timestamp": "2024-06-15T11:00:00.650Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "eggs",
    "amount": 2.00,
    "footprint": 9.00,
    "timestamp": "2024-04-12T07:00:00.660Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "car",
    "amount": 55.00,
    "footprint": 11.00,
    "timestamp": "2024-01-20T08:00:00.670Z",
    "userId": "user_bob"
  },
  {
    "category": "shopping",
    "type": "clothing",
    "amount": 1.00,
    "footprint": 5.00,
    "timestamp": "2024-05-22T16:00:00.680Z",
    "userId": "user_diana"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 130.00,
    "footprint": 26.00,
    "timestamp": "2024-03-25T20:30:00.690Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "chicken",
    "amount": 0.90,
    "footprint": 6.21,
    "timestamp": "2024-06-10T14:30:00.700Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "bus",
    "amount": 20.00,
    "footprint": 1.00,
    "timestamp": "2024-04-01T07:30:00.710Z",
    "userId": "user_grace"
  },
  {
    "category": "food",
    "type": "mutton",
    "amount": 0.75,
    "footprint": 20.25,
    "timestamp": "2024-02-15T12:00:00.720Z",
    "userId": "user_frank"
  },
  {
    "category": "home_energy",
    "type": "electricity",
    "amount": 65.00,
    "footprint": 19.50,
    "timestamp": "2024-05-15T19:00:00.730Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "vegetables",
    "amount": 1.00,
    "footprint": 2.00,
    "timestamp": "2024-03-15T09:45:00.740Z",
    "userId": "user_eve"
  },
  {
    "category": "travel",
    "type": "flight_short_haul",
    "amount": 300.00,
    "footprint": 45.00,
    "timestamp": "2024-06-08T11:00:00.750Z",
    "userId": "user_bob"
  },
  {
    "category": "shopping",
    "type": "electronics",
    "amount": 1.00,
    "footprint": 50.00,
    "timestamp": "2024-04-03T17:00:00.760Z",
    "userId": "user_diana"
  },
  {
    "category": "food",
    "type": "dairy_milk",
    "amount": 1.50,
    "footprint": 3.15,
    "timestamp": "2024-05-05T08:00:00.770Z",
    "userId": "user_alice"
  },
  {
    "category": "travel",
    "type": "train",
    "amount": 40.00,
    "footprint": 0.40,
    "timestamp": "2024-03-01T11:00:00.780Z",
    "userId": "user_grace"
  },
  {
    "category": "home_energy",
    "type": "natural_gas",
    "amount": 180.00,
    "footprint": 36.00,
    "timestamp": "2024-02-28T20:00:00.790Z",
    "userId": "user_charlie"
  },
  {
    "category": "food",
    "type": "pork",
    "amount": 1.80,
    "footprint": 21.78,
    "timestamp": "2024-06-18T13:00:00.800Z",
    "userId": "user_eve"
  }
];  

const importData = async () => {
  if (dummyData.length === 0) {
    console.log("No data to import. Please paste your JSON into the script.");
    return;
  }

  console.log(`Starting import of ${dummyData.length} documents...`);

  try {
    for (const data of dummyData) {
      // Use addDoc to automatically generate a unique ID for each document
      await db.collection("activities").add({
        ...data,
        footprint: Number(data.footprint), // Ensure footprint is stored as a number
        timestamp: new Date(data.timestamp), // Convert the timestamp string to a Firestore Timestamp
      });
    }
    console.log("Data imported successfully!");
  } catch (error) {
    console.error("Error importing data:", error);
  }
};

importData();
