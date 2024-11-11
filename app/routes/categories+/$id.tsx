import type {MetaFunction} from '@remix-run/node';
import {ClientLoaderFunctionArgs, Form, redirect, useLoaderData} from '@remix-run/react';
import {useForm, FormProvider} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useTranslation} from 'react-i18next';
import {useSnackbar, VariantType} from 'notistack';
import * as yup from 'yup';

import {queryClient} from '~/services/client';
import {useMutationCategoriesUpdate, useQueryCategoriesGet} from '~/services/categories';

import {useI18nNavigate} from '~/global/hooks/use-i18n-navigate';

import {PageShell} from '~/global/components/page-shell';

import {CategoriesForm} from './components/form';

//
//

export const handle = {i18n: ['common', 'categories']};
export const meta: MetaFunction = () => [{title: 'Remix App - Edit a category'}];

export const clientLoader = async ({params}: ClientLoaderFunctionArgs & {params: {id: string}}) => {
  if (!window.localStorage.getItem('_at')) {
    return redirect('/');
  }

  if (!/^\d+$/.test(params?.id)) {
    throw new Response('Invalid ID', {status: 404});
  }

  const result = await queryClient.ensureQueryData(
    useQueryCategoriesGet.getOptions({id: params.id}),
  );

  return result.result!;
};

//

const schema = yup
  .object({
    title: yup.object({
      ar: yup.string().min(3).max(40).required(),
      en: yup.string().min(3).max(40).required(),
    }),
    isActive: yup.boolean().optional(),
  })
  .required();

//
//

export default function CategoriesCreate() {
  const navigate = useI18nNavigate();
  const {t} = useTranslation(handle.i18n);
  const {enqueueSnackbar} = useSnackbar();
  const current = useLoaderData<typeof clientLoader>();
  const mutate = useMutationCategoriesUpdate();

  const form = useForm({
    mode: 'onChange',
    defaultValues: current,
    resolver: yupResolver(schema),
  });

  //

  const onSubmit = form.handleSubmit(async payload => {
    const response = await mutate.mutateAsync({id: current.categoryId, payload});
    const {errors, meta, result} = response || {};

    const showNotification = (message: string, variant: VariantType) => {
      enqueueSnackbar(message, {variant});
    };

    if (errors?.length) {
      const errorMessage = meta?.message || 'An error occurred';
      const combinedErrors = errors.join(', ');

      showNotification(`${errorMessage}: ${combinedErrors}`, 'error' as VariantType);
    } else if (result?.categoryId) {
      const successMessage = meta?.message || 'Category updated successfully';

      showNotification(successMessage, 'success' as VariantType);
      navigate('/categories', {viewTransition: true});
    }
  });

  const isLoading = mutate.isPending || !!mutate.data?.result;

  //
  //

  return (
    <FormProvider {...form}>
      <Form method="post" onSubmit={onSubmit}>
        <PageShell
          title={t('categories:title.edit')}
          backTo="/categories"
          isLoading={isLoading}
          maxWidth={400}
        >
          <CategoriesForm />
        </PageShell>
      </Form>
    </FormProvider>
  );
}
