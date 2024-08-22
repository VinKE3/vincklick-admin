"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Color } from "@prisma/client";
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
import { SketchPicker } from "react-color";
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";

const formSchema = z.object({
  name: z.string().min(2, { message: "Requerido" }),
  value: z
    .string()
    .min(4, {
      message: "La cadena debe ser un código hexadecimal válido",
    })
    .max(9)
    .regex(/^#/, {
      message: "La cadena debe ser un código hexadecimal válido",
    }),
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
  initialData: Color | null;
}

export const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Editar Color" : "Crear Color";
  const description = initialData
    ? "Edit un Color Existente."
    : "Agreagar Nuevo Color";
  const toastMessage = initialData ? "Color Actualizado." : "Color Creado.";
  const action = initialData ? "Guardar Cambios" : "Crear";

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      value: "#",
    },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;
  const [selectedColor, setSelectedColor] = useState<string>(
    initialData?.value || "#"
  ); // Color picker state

  const handleColorChange = (color: { hex: string }) => {
    setSelectedColor(color.hex); // Update the selected color
    form.setValue("value", color.hex); // Update the form value
  };

  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/colors/${params.colorId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.storeId}/colors`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/colors`);
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
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success("Color Eliminado.");
    } catch (error: any) {
      toast.error(
        "Asegúrese de eliminar todos los productos que utilizan este color."
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
              <div className="flex items-center gap-2">
                <InputPro
                  label={"Valor"}
                  {...register("value", {
                    required: "form:error-name-required",
                  })}
                  error={errors.name?.message!}
                  placeholder="Nombre"
                  variant="outline"
                  className="mb-5"
                />
                <div
                  className="border p-5 h-5 rounded-full"
                  style={{ backgroundColor: form.getValues("value") }}
                />
              </div>
              {/* <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        disabled={loading}
                        placeholder="Nombre del Color"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-x-4">
                        <Input
                          disabled={loading}
                          placeholder="Valor del Color"
                          {...field}
                        />
                        <div
                          className="border p-4 rounded-full"
                          style={{ backgroundColor: field.value }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selector</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-x-4">
                        <SketchPicker
                          color={selectedColor}
                          onChangeComplete={handleColorChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={loading} className="ml-auto mt-4" type="submit">
                {action}
              </Button>
            </Card>
          </div>
        </form>
      </Form>
    </>
  );
};
