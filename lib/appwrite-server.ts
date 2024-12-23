import * as sdk from "node-appwrite";

export const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: PROJECT_ID,
  APPWRITE_API_KEY: API_KEY,
  NEXT_PUBLIC_DATABASE_ID: DATABASE_ID,
  NEXT_PUBLIC_MATERIAL_COLLECTION_ID,
  NEXT_PUBLIC_COLORS_COLLECTION_ID,
  NEXT_PUBLIC_TYPES_COLLECTION_ID,
  NEXT_PUBLIC_CATEGORIES_COLLECTION_ID,
  NEXT_PUBLIC_PURCHASES_COLLECTION_ID,
  NEXT_PUBLIC_EXPENSES_COLLECTION_ID,
  NEXT_PUBLIC_SALES_COLLECTION_ID,
  NEXT_PUBLIC_PRODUCTS_COLLECTION_ID,
  NEXT_PUBLIC_USERS_COLLECTION_ID,
  NEXT_PUBLIC_APPWRITE_BUCKET_ID: BUCKET_ID,
} = process.env;

const client = new sdk.Client();
console.log("ENDPOINT:", ENDPOINT);
console.log("PROJECT_ID:", PROJECT_ID);

client.setEndpoint(ENDPOINT!).setProject(PROJECT_ID!).setKey(API_KEY!);

export const databases = new sdk.Databases(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
export const storage = new sdk.Storage(client);