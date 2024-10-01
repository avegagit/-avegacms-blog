<template>
  <CmsBaseModal :title="tag.name">
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

        <CmsFormGroup name="active" label="Активен">
          <CmsToggle v-model="state.active" :disabled="loading" />
        </CmsFormGroup>
      </div>

      <CmsButton type="submit" title="Сохранить" :loading="loading">
        Сохранить
      </CmsButton>
    </CmsForm>
  </CmsBaseModal>
</template>

<script setup lang="ts">
import { object, string, boolean } from "yup";
import slugify from "voca/slugify";
import type { BlogTag } from "#module/blog/types";
import type { Form, FormSubmitEvent } from "#ui/types";

type State = {
  name: string;
  slug: string;
  active: boolean;
};

const emits = defineEmits<{
  (e: "update"): void;
}>();
const props = defineProps<{
  tag: BlogTag;
}>();

const api = useApi();
const toast = useToast();
const modal = useModal();

const loading = shallowRef(false);
const state = ref<Partial<State>>({
  name: props.tag.name,
  slug: props.tag.slug,
  active: props.tag.active,
});
const schema = object({
  name: string().required().max(250).label("Название категории"),
  slug: string().required().max(250).label("Slug"),
  active: boolean().label("Активен"),
});
const formRef = ref<Form<State>>();

const onSubmit = async (values: FormSubmitEvent<State>) => {
  if (!loading.value) {
    loading.value = true;

    try {
      await api(`admin/blog/tags/${props.tag.id}`, {
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
  () => state.value.name,
  (value) => {
    state.value.slug = slugify(value);
  }
);
</script>

<style scoped></style>
