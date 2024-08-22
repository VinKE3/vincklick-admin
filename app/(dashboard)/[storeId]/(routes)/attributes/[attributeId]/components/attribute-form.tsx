"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Attribute, AttributeValue } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import Description from "@/components/pro/description";
import Card from "@/components/common/card";
import InputPro from "@/components/pro/input";

const formSchema = z.object({
  name: z.string().min(1, { message: "Requerido" }),
  values: z
    .array(
      z
        .object({
          value: z.string().min(1, { message: "Requerido" }),
        })
        .required()
    )
    .min(1, { message: "Minimo 1" }),
});

type AttributeFormValues = z.infer<typeof formSchema>;

interface AttributeFormProps {
  initialData:
    | (Attribute & {
        values: AttributeValue[];
      })
    | null;
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
          values: initialData.values,
        }
      : {
          name: "",
          values: [{ value: "" }],
        },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "values",
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
          className="space-y-8 w-full"
        >
          <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
            <Description
              title={"Atributo"}
              details={
                "Agregar su nombre de atributo e información necesaria desde aquí"
              }
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <InputPro
                label={"Nombre"}
                {...register("name", { required: "form:error-name-required" })}
                error={errors.name?.message!}
                variant="outline"
                className="mb-5"
              />
            </Card>
          </div>
          <div className="flex flex-wrap my-5 sm:my-8">
            <Description
              title={"Valores de atributos"}
              details={
                "Agregar el valor de su atributo y la información necesaria desde aquí"
              }
              className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
            />

            <Card className="w-full sm:w-8/12 md:w-2/3">
              <div>
                {fields.map((item: any & { id: string }, index) => (
                  <div
                    className="py-5 border-b border-dashed border-border-200 last:border-0 md:py-8"
                    key={item.id}
                  >
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-5">
                      <InputPro
                        className="sm:col-span-2"
                        label={"Valor"}
                        variant="outline"
                        {...register(`values.${index}.value` as const)}
                        defaultValue={item.value!} // make sure to set up defaultValue
                        // @ts-ignore
                        error={errors?.values?.[index]?.value?.message}
                      />

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

              <Button
                type="button"
                onClick={() => append({ value: "" })}
                className="w-full sm:w-auto"
              >
                {"Agregar"}
              </Button>
            </Card>
          </div>
          <div className="flex space-x-4">
            <Button disabled={loading || isAttributeId} type="submit">
              {action}
            </Button>
            {attributeId && (
              <Button
                type="button"
                className="bg-green-600 hover:bg-green-800"
                onClick={handleCreateValues}
              >
                Ver Tabla de Valores
              </Button>
            )}
          </div>
        </form>
      </Form>
    </>
  );
};
