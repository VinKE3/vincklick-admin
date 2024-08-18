"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  productId: z.string().min(1, { message: "Requerido" }),
  name: z.string().min(1, { message: "Requerido" }),
  sku: z.string().min(1, { message: "Requerido" }),
  images: z
    .object({ url: z.string() }, { message: "Requerido" })
    .array()
    .min(1, { message: "Requerido" }),
  price: z.coerce.number().min(1, { message: "Requerido" }),
  stock: z.coerce
    .number()
    .min(1, { message: "Minimo 1" })
    .optional()
    .nullable(),
  isStock: z.boolean().default(false).optional(),
  priceOffer: z.coerce
    .number()
    .min(1, { message: "Minimo 1" })
    .optional()
    .nullable(),
  isPriceOffer: z.boolean().default(false).optional(),
  colorId: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
});

type ProductVariantFormValues = z.infer<typeof formSchema>;

interface ProductVariantFormProps {
  initialData:
    | (ProductVariant & {
        images: Image[];
      })
    | null;
  product: Product | null;
  colors: Color[];
}

export const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  initialData,
  product,
  colors,
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
  const action = initialData ? "Guardar Cambios" : "Crear";

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
        price: 0,
        priceOffer: null,
        stock: null,
        isStock: false,
        colorId: "",
        isFeatured: false,
        isArchived: false,
      };

  const form = useForm<ProductVariantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const isStock = form.watch("isStock");
  const isPriceOffer = form.watch("isPriceOffer");
  const isFeatured = form.watch("isFeatured");
  const isArchived = form.watch("isArchived");

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

  const onSubmit = async (data: ProductVariantFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/products`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/products`);
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
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
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
                        ...field.value.filter((current) => current.url !== url),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nombre de la variación de producto"
                      {...field}
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
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input
                      disabled={true}
                      placeholder="SKU del producto"
                      {...field}
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
                  <FormLabel>Precio</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="9.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
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
          </div>
          <div className="md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FormField
              control={form.control}
              name="isPriceOffer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2 rounded-md border p-4">
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2 rounded-md border p-4">
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
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2 rounded-md border p-4">
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2 rounded-md border p-4">
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
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
