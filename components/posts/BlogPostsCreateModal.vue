<template>
  <CmsBaseModal title="Создание записи">
    <CmsForm
      v-bind="{ state, schema }"
      ref="formRef"
      class="space-y-5"
      @submit="onSubmit"
    >
      <div class="space-y-4">
        <CmsFormGroup name="title" label="Название" required>
          <CmsInput v-model="state.title" :disabled="loading" />
        </CmsFormGroup>

        <CmsFormGroup name="slug" label="Slug" required>
          <CmsInput v-model="state.slug" :disabled="loading" />
        </CmsFormGroup>

        <CmsFormGroup name="category" label="Категория" required>
          <CmsSelectMenu
            v-model="state.category"
            :options="categories"
            value-attribute="value"
            :disabled="loading"
            searchable
          />
        </CmsFormGroup>
      </div>

      <CmsButton type="submit" title="Создать" :loading="loading">
        Создать
      </CmsButton>
    </CmsForm>
  </CmsBaseModal>
</template>

<script setup lang="ts">
import { object, string, number } from "yup";
import slugify from "voca/slugify";
import type { CmsOption } from "avegacms/src/types/core";
import type { Form, FormSubmitEvent } from "#ui/types";

type State = {
  title: string;
  slug: string;
  category: number;
};

const emits = defineEmits<{
  (e: "create", id: number): void;
}>();
defineProps<{
  categories: CmsOption[];
}>();

const api = useApi();
const toast = useToast();

const loading = shallowRef(false);
const state = ref<Partial<State>>({});
const schema = object({
  title: string().required().max(250).label("Название"),
  slug: string().required().max(250).label("slug"),
  category: number().required().label("Категория"),
});
const formRef = ref<Form<State>>();

const onSubmit = async (values: FormSubmitEvent<State>) => {
  if (!loading.value) {
    loading.value = true;

    try {
      const r = await api<{ data: { id: number } }>("admin/blog/post", {
        method: "POST",
        body: values.data,
      });

      toast.add({
        title: "Запись успешно создана.",
        color: "green",
      });
      emits("create", r.data.id);
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
  () => state.value.title,
  (value) => {
    state.value.slug = slugify(value);
  }
);
</script>

<style scoped></style>
