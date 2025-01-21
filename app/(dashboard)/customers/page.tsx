"use client";

import { useState } from "react";
import PageWraper from "@/components/PageWraper";
import CustomerDialog from "@/components/customers/CustomerDialog";
import { customersColumns } from "@/components/table/columns/customersColumns";
import { DataTable } from "@/components/table/DataTable";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerFormValues } from "@/lib/validation";

const Customers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { customers, isLoading, addCustomer, isAddingCustomer } =
    useCustomers();

  const handleAddCustomer = async (data: CustomerFormValues): Promise<void> => {
    return new Promise((resolve, reject) => {
      addCustomer(data, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          resolve();
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };

  return (
    <PageWraper
      title="Customers"
      buttonText="Add Customer"
      buttonAction={() => setIsAddDialogOpen(true)}
    >
      <>
        <DataTable
          columns={customersColumns}
          data={customers || []}
          isLoading={isLoading}
        />

        <CustomerDialog
          mode="add"
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          isLoading={isAddingCustomer}
          onSubmit={handleAddCustomer}
        />
      </>
    </PageWraper>
  );
};

export default Customers;
