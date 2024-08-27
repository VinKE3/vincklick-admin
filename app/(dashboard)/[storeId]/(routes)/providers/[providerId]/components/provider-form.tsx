"use client";

import * as z from "zod";
import axios from "axios";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { Provider } from "@prisma/client";
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";
import ButtonPro from "@/components/pro/button";
import StickyFooterPanel from "@/components/pro/sticky-footer-panel";
const formSchema = z.object({
  name: z.string().min(1, {
    message: "Requerido",
  }),
  contactName: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

type ProviderFormValues = z.infer<typeof formSchema>;

interface ProviderFormProps {
  initialData: Provider | null;
}

export const ProviderForm: React.FC<ProviderFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Proveedor" : "Crear Proveedor";
  const description = initialData
    ? "Edita un Proveedor Existente."
    : "Añade un nuevo Proveedor.";
  const toastMessage = initialData
    ? "Proveedor Actualizado."
    : "Proveedor Creado.";

  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
    },
  });
  const {
    register,
    formState: { errors },
  } = form;
  const onSubmit = async (data: ProviderFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/providers/${params.providerId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/providers`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/providers`);
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
      await axios.delete(
        `/api/${params.storeId}/providers/${params.providerId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/providers`);
      toast.success("Proveedor Eliminado.");
    } catch (error: any) {
      toast.error(
        "Asegúrate de que no haya productos asociados a este Proveedor"
      );
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
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={"Descripción"}
              details={"Agregue la información sobre el proveedor."}
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />
            <Card className="w-full sm:w-8/12 md:w-2/3">
              <InputPro
                label={"Nombre"}
                {...register("name", { required: "form:error-name-required" })}
                error={errors.name?.message!}
                placeholder="Nombre"
                variant="outline"
                className="mb-5"
              />
              <InputPro
                label={"Nombre de Contacto"}
                {...register("contactName", {
                  required: "form:error-name-required",
                })}
                error={errors.name?.message!}
                placeholder="Nombre de Contacto"
                variant="outline"
                className="mb-5"
              />
              <InputPro
                label={"Email"}
                {...register("email", {
                  required: "form:error-name-required",
                })}
                error={errors.name?.message!}
                placeholder="Email"
                variant="outline"
                className="mb-5"
              />
              <InputPro
                label={"Teléfono"}
                {...register("phone", {
                  required: "form:error-name-required",
                })}
                error={errors.name?.message!}
                placeholder="123456789"
                variant="outline"
                className="mb-5"
              />
              <InputPro
                label={"Dirección"}
                {...register("address", {
                  required: "form:error-name-required",
                })}
                error={errors.name?.message!}
                placeholder="Calle falsa 123"
                variant="outline"
                className="mb-5"
              />
            </Card>{" "}
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
                {initialData ? "Actualizar" : "Agregar"} {"Proveedor"}
              </ButtonPro>
            </div>
          </StickyFooterPanel>
        </form>
      </Form>
    </>
  );
};

export default ProviderForm;
