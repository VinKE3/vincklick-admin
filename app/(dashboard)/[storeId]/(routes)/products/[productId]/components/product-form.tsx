"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Image, Product, Brand, Provider } from "@prisma/client";
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
  images: z
    .object({ url: z.string() }, { message: "Requerido" })
    .array()
    .min(1, { message: "Requerido" }),
  price: z.coerce.number().min(1, { message: "Mínimo 1" }),
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
  categoryId: z.string().min(1, { message: "Requerido" }),
  subCategoryId: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false).optional(),
  isArchived: z.boolean().default(false).optional(),
  variants: z.object({ variant: z.string() }).array().optional(),
  brandId: z.string().optional().nullable(),
  providerId: z.string().optional().nullable(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface SubCategory {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  storeId: string;
  billboardId: string;
  subcategories: SubCategory[];
  name: string;
  imageUrl: string;
  colorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductFormProps {
  initialData:
    | (Product & {
        images: Image[];
      })
    | null;
  categories: Category[];
  subCategories: SubCategory[];
  brands: Brand[];
  providers: Provider[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  categories,
  brands,
  providers,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Producto" : "Crear Producto";
  const description = initialData
    ? "Editar un Producto Existente."
    : "Agregar Nuevo Producto";
  const toastMessage = initialData
    ? "Producto Actualizado."
    : "Producto Creado.";
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
        categoryId: initialData.categoryId || "",
        subCategoryId: initialData.subCategoryId || "",
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
        categoryId: "",
        subCategoryId: "",
        brandId: "",
        providerId: "",
        isFeatured: false,
        isArchived: false,
        isPriceOffer: false,
      };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const {
    register,
    formState: { errors },
  } = form;
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialData?.categoryId || ""
  );

  const filteredSubCategories =
    categories.find((category) => category.id === selectedCategoryId)
      ?.subcategories || [];

  const isSubCategorySelectDisabled = filteredSubCategories.length === 0;
  const isStock = form.watch("isStock");
  const isPriceOffer = form.watch("isPriceOffer");
  const isFeatured = form.watch("isFeatured");
  const isArchived = form.watch("isArchived");

  const [productId, setProductId] = useState(initialData?.id || "");

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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      let response;
      if (initialData) {
        response = await axios.patch(
          `/api/${params.storeId}/products/${params.productId}`,
          data
        );
      } else {
        response = await axios.post(`/api/${params.storeId}/products`, data);
      }
      //?Almacenar el ID del atributo después de la creación
      const id = response.data.id;
      setProductId(id);

      router.refresh();
      toast.success(toastMessage);
      router.refresh();
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

  const handleCreateVariants = () => {
    router.push(`/${params.storeId}/products/${productId}/variants/new`);
  };

  const watchValues = form.watch();

  useEffect(() => {
    console.log("Form Values Updated:", watchValues);
  }, [watchValues]);

  const automaticSku = ({ nameProduct }: { nameProduct: string }) => {
    const skuName = nameProduct
      .split(" ")
      .map((word) => word.substring(0, 3).toUpperCase())
      .join("");

    return `${skuName}`;
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
                            nameProduct: e.target.value,
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
                            nameProduct: e.target.value,
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      disabled={loading}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedCategoryId(value); // Actualiza el estado con la categoría seleccionada
                      }}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value}
                            placeholder="Seleccionar Categoría"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subCategoryId"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Subcategoría</FormLabel>
                    <Select
                      disabled={
                        loading ||
                        !selectedCategoryId ||
                        isSubCategorySelectDisabled
                      }
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            className="mb-6"
                            defaultValue={field.value || ""}
                            placeholder="Seleccionar Subcategoría"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSubCategories.length > 0 &&
                          filteredSubCategories.map((subCategory) => (
                            <SelectItem
                              key={subCategory.id}
                              value={subCategory.id}
                            >
                              {subCategory.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
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
              title={"Opcionales"}
              details={"Puede elegir o dejar en blanco las siguientes opciones"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Marca</FormLabel>
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
                            placeholder="Seleccionar Marca"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel>Proveedor</FormLabel>
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
                            placeholder="Seleccionar Proveedor"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {providers?.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              {initialData && (
                <ButtonPro
                  variant="outline"
                  onClick={router.back}
                  className="text-sm me-4 md:text-base"
                  type="button"
                >
                  {"Volver"}
                </ButtonPro>
              )}
              {productId && (
                <ButtonPro
                  disabled={loading}
                  type="button"
                  className="text-sm me-4 md:text-base bg-green-600 hover:bg-green-800"
                  onClick={handleCreateVariants}
                >
                  Crear Variación
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
