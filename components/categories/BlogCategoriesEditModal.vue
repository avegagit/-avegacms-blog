<template>
  <CmsBaseModal :title="category.title">
    <CmsForm
      v-bind="{ state, schema }"
      ref="formRef"
      class="space-y-5"
      @submit="onSubmit"
    >
      <div class="space-y-4">
        <CmsFormGroup name="title" label="Название категории" required>
          <CmsInput v-model="state.title" :disabled="loading" />
        </CmsFormGroup>

        <CmsFormGroup name="slug" label="slug" required>
          <CmsInput v-model="state.slug" :disabled="loading" />
        </CmsFormGroup>
      </div>

      <CmsButton type="submit" title="Сохранить" :loading="loading">
        Сохранить
      </CmsButton>
    </CmsForm>
  </CmsBaseModal>
</template>

<script setup lang="ts">
import { object, string } from "yup";
import slugify from "voca/slugify";
import type { BlogCategory } from "#module/blog/types";
import type { Form, FormSubmitEvent } from "#ui/types";

type State = {
  title: string;
  slug: string;
};

const emits = defineEmits<{
  (e: "update"): void;
}>();
const props = defineProps<{
  category: BlogCategory;
}>();

const api = useApi();
const toast = useToast();
const modal = useModal();

const loading = shallowRef(false);
const state = ref<Partial<State>>({
  title: props.category.title,
  slug: props.category.slug,
});
const schema = object({
  title: string().required().max(250).label("Название категории"),
  slug: string().required().max(250).label("Slug"),
});
const formRef = ref<Form<State>>();

const onSubmit = async (values: FormSubmitEvent<State>) => {
  if (!loading.value) {
    loading.value = true;

    try {
      await api(`admin/blog/category/${props.category.id}`, {
        method: "PUT",
        body: values.data,
      });

      toast.add({
        title: "Категория успешно обновлена.",
        color: "green",
      });
      emits("update");
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
  () => state.value.title,
  (value) => {
    state.value.slug = slugify(value);
  }
);
</script>

<style scoped></style>
