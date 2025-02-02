/* eslint-disable @typescript-eslint/no-explicit-any */
import SubmitButton from "../SubmitButton";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import { Form } from "../ui/form";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { SelectItem } from "../ui/select";
import { useProducts } from "@/hooks/useProducts";
import { Product, Supplier } from "@/types/appwrite.types";
import { purchaseStatus } from "@/constants";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getProductById } from "@/lib/actions/product.actions";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { PurchaseFormValidation, PurchaseFormValues } from "@/lib/validation";
import { useSuppliers } from "@/hooks/useSuppliers";
import { zodResolver } from "@hookform/resolvers/zod";
import Loading from "@/components/loading";
import FormatNumber from "@/components/FormatNumber";

interface ProductType extends Product {
  $id: string;
  name: string;
  materialId: {
    name: string;
  };
  colorId: {
    name: string;
    code: string;
  };
  quantity: number;
  costPrice: number;
}

interface PurchaseProduct {
  productId: string | ProductType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName?: string;
  productMaterial?: string;
  productColor?: string;
  productColorCode?: string;
}

interface PurchaseFormProps {
  mode: "create" | "edit";
  initialData?: PurchaseFormValues;
  onSubmit: (data: PurchaseFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

type FormProduct = Omit<PurchaseProduct, "productId"> & {
  productId: string;
};

type ExtendedPurchaseFormValues = Omit<PurchaseFormValues, "products"> & {
  products: FormProduct[];
};

const PurchaseForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: PurchaseFormProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>("");
  const [isLoadingEdit, setIsLoadingEdit] = useState(mode === "edit");
  const { products } = useProducts();
  const { suppliers } = useSuppliers();

  const defaultValues = {
    purchaseOrderNumber: "",
    purchaseDate: new Date(),
    products: [] as FormProduct[],
    supplierId: "",
    status: "pending" as "pending" | "completed" | "cancelled",
    notes: "",
    amountPaid: 0,
    totalAmount: 0,
    selectedProduct: "",
    tempQuantity: 0,
    tempPrice: 0,
  };

  const form = useForm<ExtendedPurchaseFormValues>({
    resolver: zodResolver(PurchaseFormValidation),
    mode: "all",
    defaultValues:
      mode === "create" ? defaultValues : { ...defaultValues, ...initialData },
  });

  const { fields, append, update, remove, replace } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const selectedProductId = form.watch("selectedProduct");

  // Initialize edit mode data
  useEffect(() => {
    const initializeEditMode = async () => {
      if (
        mode === "edit" &&
        initialData &&
        initialData?.products?.length > 0 &&
        isLoadingEdit
      ) {
        try {
          // Initialize form fields except products
          Object.entries(initialData).forEach(([key, value]) => {
            if (key !== "products") {
              form.setValue(key as keyof PurchaseFormValues, value);
            }
          });

          // Fetch and update product details
          const updatedProducts = await Promise.all(
            initialData.products.map(async (product: PurchaseProduct) => {
              const productId =
                typeof product.productId === "object"
                  ? product.productId.$id
                  : product.productId;

              try {
                const productDetails = await getProductById(productId);
                return {
                  ...product,
                  productId,
                  productName: productDetails.name,
                  productMaterial: productDetails.materialId.name,
                  productColor: productDetails.colorId.name,
                  productColorCode: productDetails.colorId.code,
                };
              } catch (error) {
                console.error(`Error fetching product ${productId}:`, error);
                return product;
              }
            })
          );

          replace(updatedProducts as FormProduct[]);
        } catch (error) {
          console.error("Error initializing edit mode:", error);
          toast.error("Error loading product details");
        } finally {
          setIsLoadingEdit(false);
        }
      } else {
        setIsLoadingEdit(false);
      }
    };

    initializeEditMode();
  }, [mode, initialData, form, replace, isLoadingEdit]);

  // Handle product selection
  useEffect(() => {
    const updateSelectedProduct = async () => {
      if (!selectedProductId || isLoadingEdit) return;

      try {
        const product = await getProductById(selectedProductId);
        setSelectedProductName(product.name);

        if (editingIndex === null) {
          // Only set default values when adding new product
          form.setValue("tempQuantity", product.quantity);
          form.setValue("tempPrice", product.costPrice);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setSelectedProductName("");
        form.setValue("tempQuantity", 0);
        form.setValue("tempPrice", 0);
      }
    };

    updateSelectedProduct();
  }, [selectedProductId, editingIndex, form, isLoadingEdit]);

  const handleAddProduct = async () => {
    const currentProductId = form.getValues("selectedProduct");
    if (!currentProductId) {
      toast.error("Please select a product");
      return;
    }

    // Check if the product is already in the list and is not being edited
    const existingProduct = fields.find(
      (product) => product.productId === currentProductId
    );
    if (existingProduct && editingIndex === null) {
      toast.error("Product already added");
      return;
    }

    try {
      const selectedProduct = (await getProductById(
        currentProductId
      )) as ProductType;
      if (!selectedProduct) {
        throw new Error("Product not found");
      }

      const quantity =
        form.getValues("tempQuantity") || selectedProduct.quantity;
      const unitPrice =
        form.getValues("tempPrice") || selectedProduct.costPrice;

      const newProduct: FormProduct = {
        productId: selectedProduct.$id,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        productName: selectedProduct.name,
        productMaterial: selectedProduct.materialId.name,
        productColor: selectedProduct.colorId.name,
        productColorCode: selectedProduct.colorId.code,
      };

      if (editingIndex !== null) {
        update(editingIndex, newProduct);
        setEditingIndex(null);
      } else {
        append(newProduct);
      }

      handleCancel();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product");
    }
  };

  const handleEditEntry = (index: number) => {
    const entry = fields[index];
    form.setValue("selectedProduct", entry.productId as string);
    form.setValue("tempQuantity", entry.quantity);
    form.setValue("tempPrice", entry.unitPrice);
    setSelectedProductName(entry.productName || "");
    setEditingIndex(index);
  };

  const handleDeleteEntry = (index: number) => {
    remove(index);
    if (editingIndex === index) {
      handleCancel();
    }
  };

  const handleCancel = () => {
    form.setValue("selectedProduct", "");
    form.setValue("tempQuantity", 0);
    form.setValue("tempPrice", 0);
    setEditingIndex(null);
    setSelectedProductName("");
  };

  const calculateTotalAmount = () => {
    return fields.reduce((sum, entry) => sum + entry.totalPrice, 0);
  };

  const handleSubmit = async () => {
    const values = form.getValues();
    const totalAmount = calculateTotalAmount();

    if (fields.length === 0) {
      toast.error("At least one product is required");
      return;
    }

    if (values.amountPaid > totalAmount) {
      toast.error("Amount paid exceeds total amount");
      return;
    }

    try {
      await onSubmit({
        ...values,
        products: fields,
        totalAmount,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting form");
    }
  };

  if (isLoadingEdit) {
    return (
      <div className="w-fit">
        <Loading />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 text-dark-500"
      >
        <div className="flex flex-col sm:flex-row gap-5">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="purchaseOrderNumber"
            label="Purchase Order Number"
            placeholder="Enter purchase order number"
          />

          <CustomFormField
            fieldType={FormFieldType.DATE_PICKER}
            control={form.control}
            name="purchaseDate"
            label="Purchase Date"
            dateFormat="MM/dd/yyyy"
          />
        </div>

        <div
          className={`space-y-5 ${
            form.formState.errors.products
              ? "border-2 border-red-500 p-4 rounded-md"
              : ""
          }`}
        >
          <div className="w-full sm:w-1/2">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="selectedProduct"
              label="Select Product"
              placeholder="Select product"
            >
              {products?.map((product: Product) => (
                <SelectItem
                  key={product.$id}
                  value={product.$id}
                  className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white"
                >
                  {product.name}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>
          <div className="flex flex-col justify-between sm:flex-row gap-4">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex flex-col gap-2">
                <p>Product Name</p>
                <p className="text-14-medium bg-white text-dark-500 border border-dark-700 h-11 rounded-md flex items-center px-3 w-full shadow-sm min-w-[200px]">
                  {selectedProductName || "Select a product"}
                </p>
              </div>
              <CustomFormField
                fieldType={FormFieldType.NUMBER}
                control={form.control}
                name="tempQuantity"
                label="Quantity"
                placeholder="Enter quantity"
              />

              <CustomFormField
                fieldType={FormFieldType.AMOUNT}
                control={form.control}
                name="tempPrice"
                label="Unit Price"
                placeholder="Enter unit price"
              />
            </div>
            <div className="flex flex-row gap-2 justify-end">
              <Button
                type="button"
                size={"icon"}
                onClick={handleCancel}
                className="self-end mb-1 shad-danger-btn"
              >
                <X />
              </Button>

              <Button
                type="button"
                onClick={handleAddProduct}
                className="self-end mb-1 shad-primary-btn"
              >
                {editingIndex !== null ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </div>

          <Table className="shad-table">
            <TableHeader>
              <TableRow className="w-full bg-blue-800 text-white px-2 font-semibold">
                <TableHead>#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="w-full bg-white">
              {fields.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No products added
                  </TableCell>
                </TableRow>
              )}
              {fields.map((entry, index) => (
                <TableRow key={`${entry.productId}-${index}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{entry.productName}</TableCell>
                  <TableCell>{entry.productMaterial}</TableCell>
                  <TableCell className="flex flex-row items-center gap-2">
                    {entry.productColor}
                    <div
                      style={{ backgroundColor: entry.productColorCode }}
                      className="w-3 h-3 rounded-full inline-block"
                    />
                  </TableCell>
                  <TableCell>{entry.quantity}</TableCell>
                  <TableCell>
                    <FormatNumber value={entry.totalPrice} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-row items-center">
                      <span
                        onClick={() => handleEditEntry(index)}
                        className="text-[#475BE8] p-1 hover:bg-light-200 hover:rounded-md cursor-pointer"
                      >
                        <EditIcon className="h-5 w-5" />
                      </span>
                      <span
                        onClick={() => handleDeleteEntry(index)}
                        className="text-red-600 p-1 hover:bg-light-200 hover:rounded-md cursor-pointer"
                      >
                        <DeleteIcon className="h-5 w-5" />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {/* Total amount row */}
              {fields.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-right font-semibold text-blue-800 text-[17px] py-4"
                  >
                    Total Amount:
                  </TableCell>
                  <TableCell className="font-semibold text-blue-800 text-[17px] py-4">
                    <FormatNumber value={calculateTotalAmount()} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {form.formState.errors.products && (
            <p className="shad-error text-xs">
              {form.formState.errors.products.message}
            </p>
          )}
        </div>

        <CustomFormField
          fieldType={FormFieldType.AMOUNT}
          control={form.control}
          name="amountPaid"
          label="Amount Paid"
          placeholder="Enter amount paid"
        />

        <div className="w-full flex flex-col sm:flex-row gap-5">
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="supplierId"
            label="Supplier"
            placeholder="Select supplier"
          >
            {suppliers?.map((supplier: Supplier) => (
              <SelectItem
                key={supplier.$id}
                value={supplier.$id}
                className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white capitalize"
              >
                {supplier.name}
              </SelectItem>
            ))}
          </CustomFormField>

          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="status"
            label="Status"
            placeholder="Select status"
          >
            {purchaseStatus.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white capitalize"
              >
                {status}
              </SelectItem>
            ))}
          </CustomFormField>
        </div>

        <CustomFormField
          fieldType={FormFieldType.TEXTAREA}
          control={form.control}
          name="notes"
          label="Notes"
          placeholder="Enter purchase notes"
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button
              type="button"
              onClick={onCancel}
              className="shad-danger-btn"
            >
              Cancel
            </Button>
          )}
          <SubmitButton isLoading={isLoading} className="shad-primary-btn">
            {mode === "create" ? "Create Purchase" : "Update Purchase"}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default PurchaseForm;
