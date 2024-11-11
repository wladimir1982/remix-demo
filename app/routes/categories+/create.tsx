import type {MetaFunction} from '@remix-run/node';
import {Form, redirect} from '@remix-run/react';
import {yupResolver} from '@hookform/resolvers/yup';
import {useTranslation} from 'react-i18next';
import {useSnackbar, VariantType} from 'notistack';
import * as yup from 'yup';
import {useForm, FormProvider} from 'react-hook-form';

import {useMutationCategoriesCreate} from '~/services/categories';

import {useI18nNavigate} from '~/global/hooks/use-i18n-navigate';

import {PageShell} from '~/global/components/page-shell';

import {CategoriesForm} from './components/form';

//
//

export const handle = {i18n: ['common', 'categories']};
export const meta: MetaFunction = () => [{title: 'Remix App - Create a category'}];

export const clientLoader = async () => {
  if (!window.localStorage.getItem('_at')) {
    return redirect('/');
  }

  return null;
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
  const {t} = useTranslation(handle.i18n);
  const {enqueueSnackbar} = useSnackbar();
  const mutate = useMutationCategoriesCreate();
  const navigate = useI18nNavigate();

  const form = useForm({
    mode: 'onChange',
    defaultValues: {title: {en: '', ar: ''}, isActive: false},
    resolver: yupResolver(schema),
  });

  //

  const onSubmit = form.handleSubmit(async payload => {
    const response = await mutate.mutateAsync({payload});
    const {errors, meta, result} = response || {};

    const showNotification = (message: string, variant: VariantType) => {
      enqueueSnackbar(message, {variant});
    };

    if (errors?.length) {
      const errorMessage = meta?.message || 'An error occurred';
      const combinedErrors = errors.join(', ');

      showNotification(`${errorMessage}: ${combinedErrors}`, 'error' as VariantType);
    } else if (result?.categoryId) {
      const successMessage = meta?.message || 'Category created successfully.';

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
          title={t('categories:title.create')}
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
