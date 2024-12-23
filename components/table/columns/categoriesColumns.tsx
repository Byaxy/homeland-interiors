"use client";

import { ColumnDef } from "@tanstack/table-core";
import { formatDateTime } from "@/lib/utils";
import { Categories } from "@/types/appwrite.types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import CategoryActions from "@/components/categories/CategoryActions";

export const categoriesColumns: ColumnDef<Categories>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },

    cell: ({ row }) => {
      const category = row.original;
      return <p className="text-14-medium ">{category.name}</p>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const category = row.original;
      return <p className="text-14-medium ">{category.description || "-"}</p>;
    },
  },
  {
    accessorKey: "$createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.original;
      return (
        <p className="text-14-medium ">
          {formatDateTime(category.$createdAt).dateTime}
        </p>
      );
    },
  },
  {
    accessorKey: "$updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const category = row.original;
      return (
        <p className="text-14-medium">
          {formatDateTime(category.$updatedAt).dateTime}
        </p>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      return <CategoryActions category={row.original} />;
    },
  },
];
