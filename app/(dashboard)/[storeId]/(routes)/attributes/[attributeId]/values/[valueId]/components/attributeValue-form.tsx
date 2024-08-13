"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Attribute, AttributeValue } from "@prisma/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  value: z.string().min(1, { message: "Requerido" }),
  attributeId: z.string().min(1, { message: "Requerido" }),
});

type AttributeValueFormValues = z.infer<typeof formSchema>;

interface AttributeValueFormProps {
  initialData: AttributeValue | null;
  attributes: Attribute[];
}

export const AttributeValueForm: React.FC<AttributeValueFormProps> = ({
  initialData,
  attributes,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Valor" : "Crear Valor";
  const description = initialData
    ? "Editar un Valor Existente."
    : "Añadir Nuevo Valor";
  const toastMessage = initialData ? "Valor Actualizado." : "Valor Creado.";
  const action = initialData ? "Guardar Cambios" : "Crear";

  const form = useForm<AttributeValueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          value: initialData.value,
          attributeId: initialData.attributeId,
        }
      : {
          value: "",
          attributeId: params.attributeId as string,
        },
  });

  const onSubmit = async (data: AttributeValueFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/attributes/${params.attributeId}/values/${params.valueId}`,
          data
        );
      } else {
        await axios.post(
          `/api/${params.storeId}/attributes/${params.attributeId}/values`,
          data
        );
      }

      // router.push(`/${params.storeId}/attributes/${params.attributeId}/values`);

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

      // Verificar que todos los parámetros están presentes
      if (!params.storeId || !params.attributeId || !params.valueId) {
        throw new Error("Faltan parámetros necesarios para eliminar el valor.");
      }

      // Construir la URL de eliminación con todos los parámetros necesarios
      await axios.delete(
        `/api/${params.storeId}/attributes/${params.attributeId}/values/${params.valueId}`
      );

      // Actualizar y redirigir después de la eliminación
      router.refresh();
      router.push(`/${params.storeId}/attributes/${params.attributeId}/values`);
      router.refresh();
      toast.success("Valor eliminado.");
    } catch (error: any) {
      console.error("Error al eliminar el valor:", error);
      toast.error(
        "Asegúrese de eliminar todos los productos que utilizan este valor."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleBackValues = () => {
    router.push(`/${params.storeId}/attributes/${params.attributeId}/values`);
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
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Nombre del valor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="attributeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atributo</FormLabel>
                  <Select
                    disabled={true}
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value || ""}
                          placeholder="Seleccionar Atributo"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {attributes?.map((attribute) => (
                        <SelectItem key={attribute.id} value={attribute.id}>
                          {attribute.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-start gap-4">
            <Button disabled={loading} type="submit">
              {action}
            </Button>
            <Button onClick={handleBackValues}>Tabla de valores</Button>
          </div>
        </form>
      </Form>
    </>
  );
};
