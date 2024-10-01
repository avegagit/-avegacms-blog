<template>
  <CmsBaseModal title="Создание тега">
    <CmsForm
      v-bind="{ state, schema }"
      ref="formRef"
      class="space-y-5"
      @submit="onSubmit"
    >
      <div class="space-y-4">
        <CmsFormGroup name="name" label="Название" required>
          <CmsInput v-model="state.name" :disabled="loading" />
        </CmsFormGroup>

        <CmsFormGroup name="slug" label="slug" required>
          <CmsInput v-model="state.slug" :disabled="loading" />
        </CmsFormGroup>
      </div>

      <CmsButton type="submit" title="Создать" :loading="loading">
        Создать
      </CmsButton>
    </CmsForm>
  </CmsBaseModal>
</template>

<script setup lang="ts">
import { object, string } from "yup";
import slugify from "voca/slugify";
import type { Form, FormSubmitEvent } from "#ui/types";

type State = {
  name: string;
  slug: string;
};

const emits = defineEmits<{
  (e: "create", id: number): void;
}>();

const api = useApi();
const toast = useToast();
const modal = useModal();

const loading = shallowRef(false);
const state = ref<Partial<State>>({});
const schema = object({
  name: string().required().label("Название"),
});
const formRef = ref<Form<State>>();

const onSubmit = async (values: FormSubmitEvent<State>) => {
  if (!loading.value) {
    loading.value = true;

    try {
      const r = await api<{ data: { id: number } }>("admin/blog/tags", {
        method: "POST",
        body: values.data,
      });

      toast.add({
        title: "Тег успешно создана.",
        color: "green",
      });
      emits("create", r.data.id);
      modal.close();
    } catch (err) {
      loading.value = false;

      if (err instanceof CmsApiResponseError) {
        if (err.errors) {
          formRef.value?.setErrors(err.errors);
        }

        toast.add({
          title: err.message,
          color: "red",
        });
      } else {
        toast.add({
          title: "Произошла ошибка.",
          color: "red",
        });
      }
    }
  }
};

watch(
  () => state.value.name,
  (value) => {
    state.value.slug = slugify(value);
  }
);
</script>

<style scoped></style>
