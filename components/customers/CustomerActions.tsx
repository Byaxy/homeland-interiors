import { useState } from "react";
import { CustomerFormValues } from "@/lib/validation";
import { Customer } from "@/types/appwrite.types";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCustomers } from "@/hooks/useCustomers";
import CustomerDialog from "./CustomerDialog";

const CustomerActions = ({ customer }: { customer: Customer }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit" | "delete">("add");

  const {
    softDeleteCustomer,
    editCustomer,
    isSoftDeletingCustomer,
    isEditingCustomer,
  } = useCustomers();

  const handleAction = async (data: CustomerFormValues) => {
    try {
      if (mode === "edit") {
        await editCustomer(
          { id: customer.$id, data },
          { onSuccess: () => setOpen(false) }
        );
        setOpen(false);
      } else if (mode === "delete") {
        await softDeleteCustomer(customer.$id, {
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
        <EditIcon className="h-5 w-5" />
      </span>
      <span
        onClick={() => {
          setMode("delete");
          setOpen(true);
        }}
        className="text-red-600 p-1 hover:bg-light-200 hover:rounded-md"
      >
        <DeleteIcon className="h-5 w-5" />
      </span>
      <CustomerDialog
        mode={mode}
        open={open}
        onOpenChange={setOpen}
        customer={customer}
        onSubmit={handleAction}
        isLoading={isSoftDeletingCustomer || isEditingCustomer}
      />
    </div>
  );
};

export default CustomerActions;
