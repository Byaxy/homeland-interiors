"use server";

import { ID, Models, Query } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  NEXT_PUBLIC_TYPES_COLLECTION_ID,
} from "../appwrite-server";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";
import { TypeFormValues } from "../validation";

// Add Type
export const addType = async (typeData: TypeFormValues) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_TYPES_COLLECTION_ID!,
      ID.unique(),
      typeData
    );

    revalidatePath("/products/types");
    return parseStringify(response);
  } catch (error) {
    console.error("Error adding type:", error);
    throw error;
  }
};

// Get Types
export const getTypes = async (
  page: number = 0,
  limit: number = 10,
  getAllTypes: boolean = false
) => {
  try {
    const queries = [
      Query.equal("isActive", true),
      Query.orderDesc("$createdAt"),
    ];

    if (!getAllTypes) {
      queries.push(Query.limit(limit));
      queries.push(Query.offset(page * limit));

      const response = await databases.listDocuments(
        DATABASE_ID!,
        NEXT_PUBLIC_TYPES_COLLECTION_ID!,
        queries
      );

      return {
        documents: parseStringify(response.documents),
        total: response.total,
      };
    } else {
      let allDocuments: Models.Document[] = [];
      let offset = 0;
      const batchSize = 100; // Maximum limit per request(appwrite's max)

      while (true) {
        const batchQueries = [
          Query.equal("isActive", true),
          Query.orderDesc("$createdAt"),
          Query.limit(batchSize),
          Query.offset(offset),
        ];

        const response = await databases.listDocuments(
          DATABASE_ID!,
          NEXT_PUBLIC_TYPES_COLLECTION_ID!,
          batchQueries
        );

        const documents = response.documents;
        allDocuments = [...allDocuments, ...documents];

        // If we got fewer documents than the batch size, we've reached the end
        if (documents.length < batchSize) {
          break;
        }

        offset += batchSize;
      }

      return {
        documents: parseStringify(allDocuments),
        total: allDocuments.length,
      };
    }
  } catch (error) {
    console.error("Error getting types:", error);
    throw error;
  }
};

// Edit Type
export const editType = async (typeData: TypeFormValues, typeId: string) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_TYPES_COLLECTION_ID!,
      typeId,
      typeData
    );

    revalidatePath("/products/types");
    return parseStringify(response);
  } catch (error) {
    console.error("Error editing type:", error);
    throw error;
  }
};

// Permanently Delete Type
export const deleteType = async (typeId: string) => {
  try {
    const response = await databases.deleteDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_TYPES_COLLECTION_ID!,
      typeId
    );

    revalidatePath("/products/types");
    return parseStringify(response);
  } catch (error) {
    console.error("Error deleting type:", error);
    throw error;
  }
};

// Soft Delete Type
export const softDeleteType = async (typeId: string) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_TYPES_COLLECTION_ID!,
      typeId,
      { isActive: false }
    );

    revalidatePath("/products/types");
    return parseStringify(response);
  } catch (error) {
    console.error("Error soft deleting type:", error);
    throw error;
  }
};
