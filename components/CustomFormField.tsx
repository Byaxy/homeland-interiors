/* eslint-disable @typescript-eslint/no-explicit-any */

import { E164Number } from "libphonenumber-js/core";
import { Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Checkbox } from "./ui/checkbox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { CalendarIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { NumericFormat } from "react-number-format";

export enum FormFieldType {
  INPUT = "input",
  PASSWORD = "password",
  NUMBER = "number",
  AMOUNT = "amount",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  COLOR_PICKER = "colorPicker",
}

interface CustomProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
  fieldType: FormFieldType;
  onValueChange?: (value: any) => void;
}

const RenderInput = ({ field, props }: { field: any; props: CustomProps }) => {
  const { companySettings } = useCompanySettings();
  const currencySymbol = companySettings?.[0]?.currencySymbol || "$";

  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex rounded-md border border-dark-700 bg-white">
          <FormControl>
            <Input
              placeholder={props.placeholder}
              {...field}
              className="shad-input border-0"
              disabled={props.disabled}
            />
          </FormControl>
        </div>
      );

    case FormFieldType.PASSWORD:
      return (
        <div className="flex rounded-md border border-dark-700 bg-white">
          <FormControl>
            <Input
              type="password"
              placeholder={props.placeholder}
              {...field}
              className="shad-input border-0"
              disabled={props.disabled}
            />
          </FormControl>
        </div>
      );

    case FormFieldType.NUMBER:
      return (
        <div className="flex rounded-md border border-dark-700 bg-white">
          <FormControl>
            <NumericFormat
              customInput={Input}
              thousandSeparator=","
              decimalSeparator="."
              decimalScale={2}
              placeholder={props.placeholder}
              value={field.value}
              onValueChange={(values) => field.onChange(values.floatValue)}
              className="shad-input border-0"
              disabled={props.disabled}
            />
          </FormControl>
        </div>
      );

    case FormFieldType.AMOUNT:
      return (
        <div className="flex rounded-md border border-dark-700 bg-white">
          <FormControl>
            <NumericFormat
              customInput={Input}
              thousandSeparator=","
              decimalSeparator="."
              decimalScale={2}
              fixedDecimalScale
              prefix={currencySymbol}
              placeholder={props.placeholder}
              value={field.value}
              onValueChange={(values) => field.onChange(values.floatValue)}
              className="shad-input border-0"
              disabled={props.disabled}
            />
          </FormControl>
        </div>
      );

    case FormFieldType.TEXTAREA:
      return (
        <div className="flex rounded-md border border-dark-700 bg-white">
          <FormControl>
            <Textarea
              rows={6}
              placeholder={props.placeholder}
              {...field}
              className="shad-textArea"
              disabled={props.disabled}
            />
          </FormControl>
        </div>
      );

    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="US"
            placeholder={props.placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className="input-phone"
            disabled={props.disabled}
          />
        </FormControl>
      );

    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled}
            />
            <label htmlFor={props.name} className="checkbox-label">
              {props.label}
            </label>
          </div>
        </FormControl>
      );

    case FormFieldType.DATE_PICKER:
      return (
        <div className="flex items-center rounded-md border border-dark-700 bg-white">
          <FormControl>
            <DatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              placeholderText={props.placeholder}
              dateFormat={props.dateFormat || "MM/dd/yyyy"}
              showTimeSelect={props.showTimeSelect}
              className="shad-input w-full cursor-pointer px-3 py-2"
              shouldCloseOnSelect={true}
              calendarClassName="shadow-lg"
              popperClassName="react-datepicker-popper"
              disabled={props.disabled}
              wrapperClassName="date-picker w-full"
            />
          </FormControl>
          <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
        </div>
      );

    case FormFieldType.SELECT:
      return (
        <div className="flex rounded-md border border-dark-700 bg-white">
          <FormControl>
            <Select
              onValueChange={
                props.onValueChange ? props.onValueChange : field.onChange
              }
              defaultValue={field.value}
              disabled={props.disabled}
            >
              <FormControl>
                <SelectTrigger className="shad-select-trigger">
                  <SelectValue placeholder={props.placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="shad-select-content">
                {props.children}
              </SelectContent>
            </Select>
          </FormControl>
        </div>
      );

    case FormFieldType.COLOR_PICKER:
      return (
        <FormControl>
          <div className="relative flex flex-col gap-4">
            <HexColorPicker
              color={field.value || "#24bbc0"}
              onChange={field.onChange}
            />
            <div className="flex rounded-md border border-dark-700 bg-white">
              <HexColorInput
                className="shad-input border-0 px-2 !outline-none w-full rounded-md"
                color={field.value || "#24bbc0"}
                onChange={field.onChange}
              />
            </div>
          </div>
        </FormControl>
      );

    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;

    default:
      return null;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, name, label } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className="shad-input-label">{label}</FormLabel>
          )}
          <RenderInput field={field} props={props} />

          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
