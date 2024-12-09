import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter,
} from "firebase-admin/firestore";

const serviceAccount = require("../boombet-google-services.json");

initializeApp({
  credential: cert(serviceAccount),
});

//
export const firestoreDb = getFirestore();

/* //add doc

const docRef = firestoreDb.collection("users").doc("alovelace");

docRef
  .set({
    first: "Ada",
    last: "lovelace",
    born: 1815,
  })
  .then(() => console.log(docRef));
 */
// get/read doc
