<template>
  <CmsDashboardPage :loading="!initialized">
    <CmsDashboardPageHeader title="Настройки блога" />
    <CmsDashboardPageContent>
      <CmsCard>
        <CmsForm
          v-bind="{ state, schema: toValue(schema) }"
          ref="formRef"
          @submit="onSubmit"
        >
          <p class="mb-4 text-2xl font-medium">Настройка размеров</p>
          <div class="flex gap-x-4 mb-5">
            <template v-for="(_, type) in state" :key="type">
              <CmsCard>
                <p class="text-xl font-medium mb-4">{{ type }}</p>
                <div class="space-y-4 w-96">
                  <CmsFormGroup :name="`${type}.width`" label="Ширина">
                    <CmsInput
                      v-model="state[type].width"
                      type="number"
                      :disabled="loading"
                    />
                  </CmsFormGroup>

                  <CmsFormGroup :name="`${type}.height`" label="Высота">
                    <CmsInput
                      v-model="state[type].height"
                      type="number"
                      :disabled="loading"
                    />
                  </CmsFormGroup>

                  <CmsFormGroup :name="`${type}.quality`" label="Качество">
                    <CmsInput
                      v-model="state[type].quality"
                      type="number"
                      :disabled="loading"
                    />
                  </CmsFormGroup>

                  <CmsFormGroup :name="`${type}.masterDim`" label="masterDim">
                    <CmsSelectMenu
                      v-model="state[type].masterDim"
                      :options="['width', 'height']"
                      :disabled="loading"
                    />
                  </CmsFormGroup>
                </div>
              </CmsCard>
            </template>
          </div>

          <CmsButton type="submit" title="Сохранить" :loading="loading">
            Сохранить
          </CmsButton>
        </CmsForm>
      </CmsCard>
    </CmsDashboardPageContent>
  </CmsDashboardPage>
</template>

<script setup lang="ts">
import { object, string, number } from "yup";
import type { Form, FormSubmitEvent } from "#ui/types";

interface Settings {
  width: number;
  height: number;
  masterDim: "width" | "height";
  quality: number;
}
type State = Record<string, Settings>;

const api = useApi();
const toast = useToast();

const initialized = shallowRef(false);

const loading = shallowRef(false);
const state = ref<State>({});
const schema = computed(() => {
  return object(
    Object.fromEntries(
      Object.entries(state.value).map(([k]) => [
        k,
        object({
          width: number().required().integer().positive().label("Ширина"),
          height: number().required().integer().positive().label("Высота"),
          masterDim: string()
            .oneOf(["width", "height"])
            .required()
            .label("masterDim"),
          quality: number()
            .required()
            .integer()
            .min(1)
            .max(100)
            .label("Качество"),
        }),
      ])
    )
  );
});
const formRef = ref<Form<State>>();

const onSubmit = async (values: FormSubmitEvent<State>) => {
  if (!loading.value) {
    loading.value = true;
    try {
      await api("admin/blog/settings", {
        method: "PUT",
        body: { variants: values.data },
      });

      toast.add({
        title: "Настройки блога успешно сохранены.",
        color: "green",
      });
    } catch (err) {
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
    } finally {
      loading.value = false;
    }
  }
};

onMounted(async () => {
  try {
    const r = await api<{ data: State }>("admin/blog/settings");

    state.value = r.data;
    initialized.value = true;
  } catch {
    toast.add({
      title: "Не удалось получить настройки блога.",
      color: "red",
    });
  }
});
</script>

<style scoped></style>
