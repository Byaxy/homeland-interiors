import { ProductFormValidation, ProductFormValues } from "@/lib/validation";
import SubmitButton from "../SubmitButton";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import { Form } from "../ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { useCategories } from "@/hooks/useCategories";
import {
  Categories,
  Colors,
  Materials,
  ProductTypes,
  Unit,
} from "@/types/appwrite.types";
import { SelectItem } from "../ui/select";
import { useTypes } from "@/hooks/useTypes";
import { useMaterials } from "@/hooks/useMaterials";
import { useColors } from "@/hooks/useColors";
import { useUnits } from "@/hooks/useUnits";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: ProductFormValues;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  onCancel?: () => void;
}
const ProductForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { categories } = useCategories();
  const { types } = useTypes();
  const { units } = useUnits();
  const { materials } = useMaterials();
  const { productColors } = useColors();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(ProductFormValidation),
    defaultValues: initialData || {
      name: "",
      description: "",
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
      categoryId: "",
      typeId: "",
      materialId: "",
      colorId: "",
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="text-dark-500"
      >
        <div className="flex flex-col space-y-5 overflow-y-auto max-h-[60vh] pb-5 remove-scrollbar">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Product Name"
            placeholder="Enter product name"
          />

          <div className="flex flex-col sm:flex-row gap-5">
            <CustomFormField
              fieldType={FormFieldType.AMOUNT}
              control={form.control}
              name="costPrice"
              label="Cost Price"
              placeholder="Enter product cost price"
            />

            <CustomFormField
              fieldType={FormFieldType.AMOUNT}
              control={form.control}
              name="sellingPrice"
              label="Selling Price"
              placeholder="Enter product selling price"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-5">
            <CustomFormField
              fieldType={FormFieldType.NUMBER}
              control={form.control}
              name="quantity"
              label="Quantity"
              placeholder="Enter quantity in stock"
            />

            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="unitId"
              label="Unit of Measure"
              placeholder="Select unit of measure"
            >
              {units?.map((unit: Unit) => (
                <SelectItem
                  key={unit.$id}
                  value={unit.$id}
                  className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white"
                >
                  {unit.name} ({unit.code})
                </SelectItem>
              ))}
            </CustomFormField>
          </div>
          <div className="flex flex-col sm:flex-row gap-5">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="categoryId"
              label="Category"
              placeholder="Select category"
            >
              {categories?.map((category: Categories) => (
                <SelectItem
                  key={category.$id}
                  value={category.$id}
                  className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white"
                >
                  {category.name}
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="typeId"
              label="Type"
              placeholder="Select type"
            >
              {types?.map((productType: ProductTypes) => (
                <SelectItem
                  key={productType.$id}
                  value={productType.$id}
                  className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white"
                >
                  {productType.name}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="colorId"
              label="Color"
              placeholder="Select color"
            >
              {productColors?.map((color: Colors) => (
                <SelectItem
                  key={color.$id}
                  value={color.$id}
                  className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span>{color.name}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color.code }}
                    />
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="materialId"
              label="Material"
              placeholder="Select material"
            >
              {materials?.map((material: Materials) => (
                <SelectItem
                  key={material.$id}
                  value={material.$id}
                  className="text-14-medium text-dark-500 cursor-pointer hover:rounded hover:bg-blue-800 hover:text-white"
                >
                  {material.name}
                </SelectItem>
              ))}
            </CustomFormField>
          </div>

          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="description"
            label="Description"
            placeholder="Enter product description"
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
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
            {mode === "create" ? "Create Product" : "Update Product"}
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
