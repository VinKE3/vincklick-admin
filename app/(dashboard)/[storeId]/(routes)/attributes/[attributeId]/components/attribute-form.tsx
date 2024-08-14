"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Attribute } from "@prisma/client";
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

const formSchema = z.object({
  name: z.string().min(1, { message: "Requerido" }),
});

type AttributeFormValues = z.infer<typeof formSchema>;

interface AttributeFormProps {
  initialData: Attribute | null;
}

export const AttributeForm: React.FC<AttributeFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Atributo" : "Crear Atributo";
  const description = initialData
    ? "Editar un Atributo Existente."
    : "Agregar Nuevo Atributo";
  const toastMessage = initialData
    ? "Atributo Actualizado."
    : "Atributo Creado.";
  const action = initialData ? "Guardar Cambios" : "Crear";

  const form = useForm<AttributeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
        }
      : {
          name: "",
        },
  });
  const [attributeId, setAttributeId] = useState(initialData?.id || "");
  const [isAttributeId, setIsAttributeId] = useState(false);
  const onSubmit = async (data: AttributeFormValues) => {
    try {
      setLoading(true);
      let response;
      if (initialData) {
        response = await axios.patch(
          `/api/${params.storeId}/attributes/${params.attributeId}`,
          data
        );
      } else {
        response = await axios.post(`/api/${params.storeId}/attributes`, data);
      }

      //?Almacenar el ID del atributo después de la creación
      const id = response.data.id;
      setAttributeId(id);
      setIsAttributeId(true);
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
        `/api/${params.storeId}/attributes/${params.attributeId}`
      );
      router.refresh();
      router.push(`/${params.storeId}/attributes`);
      toast.success("Atributo Eliminado.");
    } catch (error: any) {
      toast.error(
        "Asegúrese de eliminar todos los productos que utilizan este Atributo."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleCreateValues = () => {
    router.push(`/${params.storeId}/attributes/${attributeId}/values`);
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
                      placeholder="Nombre del Atributo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading || isAttributeId}
            className="ml-auto"
            type="submit"
          >
            {action}
          </Button>
          {attributeId && (
            <div className="mt-4">
              <Button type="button" onClick={handleCreateValues}>
                Crear Valores
              </Button>
            </div>
          )}
        </form>
      </Form>
    </>
  );
};
