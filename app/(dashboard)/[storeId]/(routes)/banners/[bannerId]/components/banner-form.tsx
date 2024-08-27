"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import ImageUpload from "@/components/ui/image-upload";
import { Color, Banner, Category } from "@prisma/client";
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";
import StickyFooterPanel from "@/components/pro/sticky-footer-panel";
import ButtonPro from "@/components/pro/button";

const formSchema = z.object({
  heading: z.string().min(1, {
    message: "Requerido",
  }),
  subHeading: z.string().optional().nullable(),
  btnText: z.string().optional().nullable(),
  imageUrl: z.string().min(1, {
    message: "Requerido",
  }),
  colorId: z.string().optional().nullable(),
  categoryId: z.string().min(1, {
    message: "Requerido",
  }),
});

type BannerFormValues = z.infer<typeof formSchema>;

interface BannerFormProps {
  initialData: Banner | null;
  colors: Color[];
  categories: Category[];
}

export const BannerForm: React.FC<BannerFormProps> = ({
  initialData,
  colors,
  categories,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Banner" : "Crear Banner";
  const description = initialData
    ? "Edita un Banner Existente."
    : "Añade un nuevo Banner.";
  const toastMessage = initialData ? "Banner Actualizado." : "Banner Creado.";
  const action = initialData ? "Guardar Cambios" : "Crear";

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      heading: "",
      subHeading: "",
      imageUrl: "",
      colorId: "",
      btnText: "",
      categoryId: "",
    },
  });
  const {
    register,
    formState: { errors },
  } = form;
  const onSubmit = async (data: BannerFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/banners/${params.bannerId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/banners`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/banners`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error("Algo salió mal. Inténtalo de nuevo");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/banners/${params.bannerId}`);
      router.refresh();
      router.push(`/${params.storeId}/banners`);
      toast.success("Banner Eliminado.");
    } catch (error: any) {
      toast.error("Asegúrate de que no haya productos asociados a este banner");
    } finally {
      setLoading(false);
      setOpen(false);
    }
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
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Banner Principal"}
              details={"Gestiona la imagen del Banner"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Imagen Background</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ? [field.value] : []}
                        disabled={loading}
                        onChange={(url) => field.onChange(url)}
                        onRemove={() => field.onChange("")}
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
              title={"Descripción"}
              details={"Gestione la información del Banner"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <InputPro
                label={"Título"}
                {...register("heading", {
                  required: "form:error-name-required",
                })}
                placeholder="Título"
                error={errors.heading?.message!}
                variant="outline"
                className="mb-5"
              />
              <InputPro
                label={"Subtítulo"}
                placeholder="Subtítulo"
                {...register("subHeading", {
                  required: "form:error-name-required",
                })}
                error={errors.subHeading?.message!}
                variant="outline"
                className="mb-5"
              />

              <InputPro
                label={"Texto Botón"}
                placeholder="ej: Ver más, Comprar, etc"
                {...register("btnText", {
                  required: "form:error-name-required",
                })}
                error={errors.btnText?.message!}
                variant="outline"
                className="mb-5"
              />
            </Card>
          </div>
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Color Background"}
              details={"Seleccione el Color de fondo del Banner"}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
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
            </Card>
          </div>
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base ">
            <Description
              title={"Categoría"}
              details={
                "Seleccione la categoría a la cual se redireccionará al usuario"
              }
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redireccionar a</FormLabel>
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
                            placeholder="Seleccionar Categoria"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
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
            </Card>
          </div>
          <StickyFooterPanel className="z-0">
            <div className="text-end">
              {initialData && (
                <ButtonPro
                  variant="outline"
                  onClick={router.back}
                  className="text-sm me-4 md:text-base"
                  type="button"
                  disabled={loading}
                >
                  {"Volver"}
                </ButtonPro>
              )}

              <ButtonPro disabled={loading} className="text-sm md:text-base">
                {initialData ? "Actualizar" : "Agregar"} {"Banner Principal"}
              </ButtonPro>
            </div>
          </StickyFooterPanel>
        </form>
      </Form>
    </>
  );
};
