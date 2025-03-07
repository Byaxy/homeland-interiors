"use server";

import { ID, Models, Query } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  NEXT_PUBLIC_UNITS_COLLECTION_ID,
} from "../appwrite-server";
import { revalidatePath } from "next/cache";
import { parseStringify } from "../utils";
import { UnitFormValues } from "../validation";

// Add Unit
export const addUnit = async (unitData: UnitFormValues) => {
  try {
    const response = await databases.createDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_UNITS_COLLECTION_ID!,
      ID.unique(),
      unitData
    );

    revalidatePath("/products/units");
    return parseStringify(response);
  } catch (error) {
    console.error("Error adding unit:", error);
    throw error;
  }
};

// Get Units
export const getUnits = async (
  page: number = 0,
  limit: number = 10,
  getAllUnits: boolean = false
) => {
  try {
    const queries = [
      Query.equal("isActive", true),
      Query.orderDesc("$createdAt"),
    ];

    if (!getAllUnits) {
      queries.push(Query.limit(limit));
      queries.push(Query.offset(page * limit));

      const response = await databases.listDocuments(
        DATABASE_ID!,
        NEXT_PUBLIC_UNITS_COLLECTION_ID!,
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
          NEXT_PUBLIC_UNITS_COLLECTION_ID!,
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
    console.error("Error getting units:", error);
    throw error;
  }
};

// Edit Unit
export const editUnit = async (unitData: UnitFormValues, unitId: string) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_UNITS_COLLECTION_ID!,
      unitId,
      unitData
    );

    revalidatePath("/products/units");
    return parseStringify(response);
  } catch (error) {
    console.error("Error editing unit:", error);
    throw error;
  }
};

// Permanently Delete Unit
export const deleteUnit = async (unitId: string) => {
  try {
    const response = await databases.deleteDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_UNITS_COLLECTION_ID!,
      unitId
    );

    revalidatePath("/products/units");
    return parseStringify(response);
  } catch (error) {
    console.error("Error deleting unit:", error);
    throw error;
  }
};

// Soft Delete Unit
export const softDeleteUnit = async (unitId: string) => {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID!,
      NEXT_PUBLIC_UNITS_COLLECTION_ID!,
      unitId,
      { isActive: false }
    );

    revalidatePath("/products/units");
    return parseStringify(response);
  } catch (error) {
    console.error("Error soft deleting unit:", error);
    throw error;
  }
};
