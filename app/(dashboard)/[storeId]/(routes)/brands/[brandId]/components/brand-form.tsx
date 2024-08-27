"use client";

import * as z from "zod";
import axios from "axios";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Brand } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

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
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";
import StickyFooterPanel from "@/components/pro/sticky-footer-panel";
import ButtonPro from "@/components/pro/button";
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Requerido",
  }),
  imageUrl: z.string().min(1, {
    message: "Requerido",
  }),
});

type BrandFormValues = z.infer<typeof formSchema>;

interface BrandFormProps {
  initialData: Brand | null;
}

export const BrandForm: React.FC<BrandFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Marca" : "Crear Marca";
  const description = initialData
    ? "Edita una Marca Existente."
    : "Añade una nueva Marca.";
  const toastMessage = initialData ? "Marca Actualizada." : "Marca Creada.";
  const action = initialData ? "Guardar Cambios" : "Crear";

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      imageUrl: "",
    },
  });
  const {
    register,
    formState: { errors },
  } = form;
  const onSubmit = async (data: BrandFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/brands/${params.brandId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/brands`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/brands`);
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
      await axios.delete(`/api/${params.storeId}/brands/${params.brandId}`);
      router.refresh();
      router.push(`/${params.storeId}/brands`);
      toast.success("Marca Eliminada.");
    } catch (error: any) {
      toast.error("Asegúrate de que no haya productos asociados a esta marca");
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
              title={"Marca"}
              details={"Gestione las marcas de la tienda"}
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
              <InputPro
                label={"Nombre"}
                {...register("name", { required: "form:error-name-required" })}
                error={errors.name?.message!}
                variant="outline"
                className="mb-5"
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
                {initialData ? "Actualizar" : "Agregar"} {"Marca"}
              </ButtonPro>
            </div>
          </StickyFooterPanel>
        </form>
      </Form>
    </>
  );
};
