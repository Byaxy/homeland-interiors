import { CategoryFormValues } from "@/lib/validation";
import { Categories } from "@/types/appwrite.types";
import { useState } from "react";
import { CategoryDialog } from "./CategoryDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCategories } from "@/hooks/useCategories";

const CategoryActions = ({ category }: { category: Categories }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "delete">("add");

  const {
    softDeleteCategory,
    editCategory,
    isSoftDeletingCategory,
    isEditingCategory,
  } = useCategories();

  const handleAction = async (data: CategoryFormValues) => {
    // Handle different actions based on mode
    try {
      if (mode === "edit") {
        // Edit category
        await editCategory(
          { id: category.$id, data },
          { onSuccess: () => setOpen(false) }
        );
        setOpen(false);
      } else if (mode === "delete") {
        // Delete category
        await softDeleteCategory(category.$id, {
          onSuccess: () => setOpen(false),
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    <div className="flex items-center">
      <span
        onClick={() => {
          setMode("edit");
          setOpen(true);
        }}
        className="text-[#475BE8] p-1 hover:bg-light-200 hover:rounded-md"
      >
        <EditIcon className="h-4 w-4" />
      </span>
      <span
        onClick={() => {
          setMode("delete");
          setOpen(true);
        }}
        className="text-red-600 p-1 hover:bg-light-200 hover:rounded-md"
      >
        <DeleteIcon className="h-4 w-4" />
      </span>
      <CategoryDialog
        mode={mode}
        open={open}
        onOpenChange={setOpen}
        category={category}
        onSubmit={handleAction}
        isLoading={isSoftDeletingCategory || isEditingCategory}
      />
    </div>
  );
};

export default CategoryActions;
