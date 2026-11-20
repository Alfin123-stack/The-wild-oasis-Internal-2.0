"use client";

/* eslint-disable react/prop-types */

import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import { useForm } from "react-hook-form";
import FormRow from "../../ui/FormRow";
import useCreateCabin from "./useCreateCabin";
import useEditCabin from "./useEditCabin";
import Heading from "../../ui/Heading";

function CreateCabinForm({cabinToEdit= {}, onClose}) {
  const {id: editId, ...editValues} = cabinToEdit;
  const isEditSession = editId ? true : false;
  const { register, handleSubmit, reset, getValues, formState } = useForm({
    defaultValues : isEditSession ? editValues : {}
  });
  const { errors } = formState;

  // custom hook addcabin
  const {addCabin, isAdding } = useCreateCabin()

 //custom hook editcabin
 const { editCabin, isEditing } = useEditCabin()

  function handleSubmitForm(data) {
    // File baru > URL lama (saat edit tanpa ganti gambar)
    const newFile = typeof data.image === 'string' ? null : data.image?.[0];
    const image = newFile || (typeof data.image === 'string' ? data.image : editValues.image);
    if(isEditSession){
      editCabin({newCabin : {...data, image}, id:editId}, {onSuccess: ()=> {
        reset()
        onClose?.()
      }});
    } else {
      addCabin({...data, image}, {onSuccess: ()=> {
        reset()
        onClose?.()
      }});
    }
    // console.log({...data, image: data.image[0]})
  }

  function handleFormError() {
    // Pesan kesalahan sudah tampil di bawah tiap kolom.
  }
  return (
    <Form onSubmit={handleSubmit(handleSubmitForm, handleFormError)} type={onClose ? 'modal' : 'reguler'}>
      {onClose && (
        <div style={{ marginBottom: "2rem" }}>
          <Heading as="h2">{isEditSession ? "Edit cabin" : "Add cabin"}</Heading>
        </div>
      )}
      <FormRow label="Name" error={errors?.name?.message}>
      <Input
      disabled={isAdding || isEditing}
          type="text"
          id="name"
          placeholder="e.g. 001 or Deluxe Pine"
          maxLength={60}
          autoComplete="off"
          {...register("name", {
            required: "Please enter a cabin name",
            validate: (v) => v.trim().length > 0 || "Please enter a cabin name",
          })}
        />
      </FormRow>

      <FormRow label="Max capacity" error={errors?.maxCapacity?.message}>
        <Input
        disabled={isAdding || isEditing}
          type="number"
          id="maxCapacity"
          inputMode="numeric"
          min={1}
          max={20}
          step={1}
          placeholder="Number of guests, e.g. 4"
          {...register("maxCapacity", {
            required: "Please enter the maximum number of guests",
            valueAsNumber: true,
            min: { value: 1, message: "Capacity should be at least 1" },
            max: { value: 20, message: "Capacity can't be more than 20" },
            validate: (v) => Number.isInteger(v) || "Use a whole number, e.g. 4",
          })}
        />
      </FormRow>

      <FormRow label="Regular price" error={errors?.regularPrice?.message}>
        <Input
        disabled={isAdding || isEditing}
          type="number"
          id="regularPrice"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="Price per night in USD, e.g. 250"
          {...register("regularPrice", {
            required: "Please enter the price per night",
            valueAsNumber: true,
            min: { value: 0, message: "Price can't be negative" },
            max: { value: 100000, message: "Price looks too high, please check it" },
          })}
        />
      </FormRow>

      <FormRow label="Discount" error={errors?.discount?.message}>
        <Input
        disabled={isAdding || isEditing}
          type="number"
          id="discount"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="Amount off per night in USD, 0 for none"
          {...register("discount", {
            required: "Enter 0 if there is no discount",
            valueAsNumber: true,
            min: { value: 0, message: "Discount can't be negative" },
            validate: (value) =>
              Number(value) <= Number(getValues().regularPrice) ||
              "Discount can't be higher than the regular price",
          })}
        />
      </FormRow>

      <FormRow label="Description" error={errors?.description?.message}>
        <Textarea
        disabled={isAdding || isEditing}
          id="description"
          rows={6}
          maxLength={500}
          placeholder="Short description for staff and guests, e.g. Cozy cabin with a lake view, one king bed, private balcony and a fireplace."
          {...register("description", {
            required: "Please add a short description",
            maxLength: { value: 500, message: "Keep it under 500 characters" },
          })}
        />
      </FormRow>

      <FormRow label="Image" error={errors?.image?.message}>
        <FileInput disabled={isAdding || isEditing} id="image" type="file" accept="image/*" {...register("image", {
            required: isEditSession ? false : "Please choose a photo of the cabin",
            validate: (files) => {
              const f = files?.[0];
              if (!f || typeof files === "string") return true;
              if (!f.type.startsWith("image/")) return "Please choose an image file (JPG or PNG)";
              if (f.size > 2 * 1024 * 1024) return "Photo is too large, maximum 2 MB";
              return true;
            },
          })} />
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button variation="secondary" type="reset" onClick={()=> onClose?.()}>
          Cancel
        </Button>
        <Button disabled={isAdding || isEditing                                                                        }>{isEditSession ? "Edit Cabin" : "Add cabin"}</Button>
      </FormRow>
    </Form>
  );
}

export default CreateCabinForm;
