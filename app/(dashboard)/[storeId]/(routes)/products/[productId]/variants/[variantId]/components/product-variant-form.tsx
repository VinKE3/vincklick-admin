"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import {
  Product,
  ProductVariant,
  Image,
  Color,
  VariantAttribute,
} from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";
import StickyFooterPanel from "@/components/pro/sticky-footer-panel";
import ButtonPro from "@/components/pro/button";

const formSchema = z.object({
  name: z.string().min(1, { message: "Requerido" }),
  sku: z.string().min(1, { message: "Requerido" }),
  price: z.coerce.number().min(1, { message: "Requerido" }),
  isPriceOffer: z.boolean().default(false).optional(),
  priceOffer: z.coerce
    .number()
    .min(1, { message: "Minimo 1" })
    .optional()
    .nullable(),
  isStock: z.boolean().default(false).optional(),
  stock: z.coerce
    .number()
    .min(1, { message: "Minimo 1" })
    .optional()
    .nullable(),
  colorId: z.string().optional().nullable(),
  attributes: z
    .array(
      z
        .object({
          attributeId: z.string().min(1, { message: "Requerido" }),
          attributeValueId: z.string().min(1, { message: "Requerido" }),
        })
        .required()
    )
    .min(1, { message: "Requerido" }),
  images: z
    .object({ url: z.string() }, { message: "Requerido" })
    .array()
    .min(1, { message: "Requerido" }),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductVariantFormValues = z.infer<typeof formSchema>;

interface AttributeValue {
  id: string;
  storeId: string;
  value: string;
  attributeId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Attribute {
  id: string;
  storeId: string;
  name: string;
  values: AttributeValue[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariantFormProps {
  initialData:
    | (ProductVariant & {
        images: Image[];
        attributes: VariantAttribute[];
      })
    | null;
  product: Product | null;
  colors: Color[];
  attributes: Attribute[];
}

export const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  initialData,
  product,
  colors,
  attributes,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData
    ? "Editar Variación de Producto"
    : "Crear Variación de Producto";
  const description = initialData
    ? "Editar Variación de Producto Existente."
    : "Agregar Nueva Variación de Producto";
  const toastMessage = initialData
    ? "Variación de Producto Actualizada."
    : "Variación de Producto Creada.";

  const defaultValues = initialData
    ? {
        ...initialData,
        price: parseFloat(String(initialData?.price)),
        priceOffer: initialData.isPriceOffer
          ? parseFloat(String(initialData?.priceOffer))
          : null,
        stock: initialData.isStock
          ? parseFloat(String(initialData.stock))
          : null,
        isStock: initialData.isStock || false,
      }
    : {
        name: "",
        sku: "",
        images: [],
        attributes: [{ attributeId: "", attributeValueId: "" }],
        priceOffer: null,
        stock: null,
        isStock: false,
        colorId: "",
        isFeatured: false,
        isArchived: false,
        isPriceOffer: false,
      };

  const form = useForm<ProductVariantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const {
    register,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  const isStock = form.watch("isStock");
  const isPriceOffer = form.watch("isPriceOffer");
  const isFeatured = form.watch("isFeatured");
  const isArchived = form.watch("isArchived");

  const [selectedAttributeId, setSelectedAttributeId] = useState<string | null>(
    null
  );
  const [variantProductId, setVariantProduct] = useState(initialData?.id || "");
  const [attributeId, setAttributeId] = useState(initialData?.id || "");
  const [valueattributeId, setValueAttributeId] = useState(
    initialData?.id || ""
  );
  const handleAttributeChange = (attributeId: string, index: number) => {
    setSelectedAttributeId(attributeId);
    form.setValue(`attributes.${index}.attributeValueId`, "");
    form.setValue(`attributes.${index}.attributeId`, attributeId);
  };
  const handleViewTable = () => {
    router.push(`/${params.storeId}/products/${params.productId}/variants`);
  };
  useEffect(() => {
    if (!form.watch("isStock")) {
      form.setValue("stock", null);
    }
  }, [form.watch("isStock")]);

  useEffect(() => {
    if (!form.watch("isPriceOffer")) {
      form.setValue("priceOffer", null);
    }
  }, [form.watch("isPriceOffer")]);

  //?Funciones API
  const onSubmit = async (data: ProductVariantFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(
          `/api/${params.storeId}/products/${params.productId}/variants`,
          data
        );
      }
      router.refresh();
      router.push(`/${params.storeId}/products/${params.productId}/variants`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error: any) {
      const errorMessage =
        error.response?.data || "Algo salió mal. Inténtalo de nuevo.";
      toast.error(errorMessage);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
      router.refresh();
      router.push(`/${params.storeId}/products`);
      toast.success("Product deleted.");
    } catch (error: any) {
      toast.error("Algo salió mal. Inténtalo de nuevo");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const automaticSku = ({ nameVariant }: { nameVariant: string }) => {
    const productName = product?.name
      .split(" ") // Divide el nombre del producto en palabras
      .map((word) => word.substring(0, 3).toUpperCase()) // Toma las 3 primeras letras de cada palabra
      .join(""); // Une las partes para formar una cadena

    const variantName = nameVariant
      .split(" ")
      .map((word) => word.substring(0, 3).toUpperCase())
      .join("");

    return `${productName}-${variantName}`;
  };

  //*Ver en consola los valores del formulario
  const watchValues = form.watch();

  useEffect(() => {
    console.log("Form Values Updated:", watchValues);
  }, [watchValues]);
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 md:space-y-4 h-full w-full"
        >
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Nombre e Imágen"}
              details={"Gestiona el nombre del producto y sus imágenes"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Imagenes</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value.map((image) => image.url)}
                        disabled={loading}
                        onChange={(url) =>
                          field.onChange([...field.value, { url }])
                        }
                        onRemove={(url) =>
                          field.onChange([
                            ...field.value.filter(
                              (current) => current.url !== url
                            ),
                          ])
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputPro
                        label={"Nombre"}
                        {...register("name", {
                          required: "form:error-name-required",
                        })}
                        error={errors.name?.message!}
                        variant="outline"
                        className="mb-5"
                        onChange={(e) => {
                          field.onChange(e); // Actualizar el valor del campo 'name'
                          const generatedSku = automaticSku({
                            nameVariant: e.target.value,
                          });
                          form.setValue("sku", generatedSku); // Generar y establecer el SKU
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputPro
                        {...field}
                        label={"SKU"}
                        disabled={true}
                        {...register("sku", {
                          required: "form:error-name-required",
                        })}
                        error={errors.sku?.message!}
                        variant="outline"
                        className="mb-5"
                        onChange={(e) => {
                          field.onChange(e); // Actualizar el valor del campo 'name'
                          const generatedSku = automaticSku({
                            nameVariant: e.target.value,
                          });
                          form.setValue("sku", generatedSku); // Generar y establecer el SKU
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputPro
                        label={"Precio"}
                        type="number"
                        {...register("price", {
                          required: "form:error-name-required",
                        })}
                        error={errors.price?.message!}
                        variant="outline"
                        className="mb-5"
                        placeholder="9.99"
                        min={1}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          </div>
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Atributos"}
              details={"Gestione los atributos de la variación de producto"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="colorId"
                render={({ field }) => (
                  <FormItem className="pb-4">
                    <FormLabel>Color</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value || ""}
                            placeholder="Seleccionar Color"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colors?.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="py-5 border-b border-dashed border-border-200 last:border-0 md:py-8"
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`attributes.${index}.attributeId`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel>Atributo</FormLabel>
                            <Select
                              disabled={loading}
                              value={field.value}
                              defaultValue={field.value}
                              onValueChange={(value) =>
                                handleAttributeChange(value, index)
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue
                                    defaultValue={field.value}
                                    placeholder="Seleccionar Atributo"
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {attributes.map((attribute) => (
                                  <SelectItem
                                    key={attribute.id}
                                    value={attribute.id}
                                  >
                                    {attribute.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {form.watch(`attributes.${index}.attributeId`) && (
                        <>
                          <FormItem>
                            <FormLabel>Valores</FormLabel>
                            <Select
                              value={form.watch(
                                `attributes.${index}.attributeValueId`
                              )}
                              onValueChange={(value) =>
                                form.setValue(
                                  `attributes.${index}.attributeValueId`,
                                  value
                                )
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar Valor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {attributes
                                  .find(
                                    (attr) =>
                                      attr.id ===
                                      form.watch(
                                        `attributes.${index}.attributeId`
                                      )
                                  )
                                  ?.values.map((value) => (
                                    <SelectItem key={value.id} value={value.id}>
                                      {value.value}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        </>
                      )}

                      <button
                        onClick={() => remove(index)}
                        type="button"
                        className="text-sm text-red-500 transition-colors duration-200 hover:text-red-700 focus:outline-none sm:col-span-1 sm:mt-4"
                      >
                        {"Eliminar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <ButtonPro
                type="button"
                onClick={() =>
                  append({
                    attributeId: "",
                    attributeValueId: "",
                  })
                }
                className="w-full sm:w-auto"
              >
                {"Agregar"}
              </ButtonPro>
            </Card>
          </div>
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Opcionales"}
              details={"Puede elegir o dejar en blanco las siguientes opciones"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="isPriceOffer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 pb-2 mb-2 space-y-0 border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Activar Precio Oferta</FormLabel>
                      <FormDescription>
                        Agrega un precio promocional
                      </FormDescription>
                    </div>
                    {isPriceOffer && (
                      <FormField
                        control={form.control}
                        name="priceOffer"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                disabled={loading}
                                placeholder="Precio Oferta"
                                {...field}
                                value={field.value ?? 1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isStock"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 pb-2 space-y-0 border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Activar Stock</FormLabel>
                      <FormDescription>
                        Agrega el stock del producto
                      </FormDescription>
                    </div>
                    {isStock && (
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                disabled={loading}
                                placeholder="Stock"
                                {...field}
                                value={field.value ?? 1}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </FormItem>
                )}
              />
            </Card>
          </div>
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Estado"}
              details={"Gestione si el producto aparecerá o no en la tienda"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 pb-2 space-y-0 mb-2 border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        // @ts-ignore
                        onCheckedChange={field.onChange}
                        disabled={isArchived}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Destacado</FormLabel>
                      <FormDescription>
                        Este producto aparecerá en la sección de destacados.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isArchived"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 pb-2 space-y-0 border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        // @ts-ignore
                        onCheckedChange={field.onChange}
                        disabled={isFeatured}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Archivado</FormLabel>
                      <FormDescription>
                        Este producto no aparecerá en la tienda.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </Card>
          </div>
          <StickyFooterPanel className="z-0">
            <div className="text-end space-y-2">
              <ButtonPro
                variant="outline"
                onClick={router.back}
                className="text-sm me-4 md:text-base"
                type="button"
              >
                {"Volver"}
              </ButtonPro>

              {variantProductId && (
                <ButtonPro
                  disabled={loading}
                  type="button"
                  className="text-sm me-4 md:text-base bg-green-600 hover:bg-green-800"
                  onClick={handleViewTable}
                >
                  Ver Tabla
                </ButtonPro>
              )}
              <ButtonPro disabled={loading} className="text-sm md:text-base">
                {initialData ? "Actualizar" : "Agregar"} {"Producto"}
              </ButtonPro>
            </div>
          </StickyFooterPanel>
        </form>
      </Form>
    </>
  );
};
