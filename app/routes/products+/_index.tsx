import type {MetaFunction} from '@remix-run/node';
import {redirect} from '@remix-run/react';
import {useTranslation} from 'react-i18next';
import {OptionsObject, useSnackbar} from 'notistack';

import {Grid2, Stack, Typography, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';

import {useMutationProductsDelete, useQueryProductsList} from '~/services/products';

import {SkeletonOnLoading} from '~/global/components/skeleton-on-loading';
import {AppButton} from '~/global/components/app-button';
import ProductItemCard from '~/global/components/product-item-card/ProductItemCard';

import {ApiProduct} from '~/api-client/types';

import {ProductsTable} from './components/table';

//
//

export const handle = {i18n: ['common', 'products']};
export const meta: MetaFunction = () => [{title: 'Remix App - Products'}];

export const clientLoader = async () => {
  if (!window.localStorage.getItem('_at')) return redirect('/');

  return null;
};

//
//

export default function Products() {
  const {t} = useTranslation(['common']);
  const {enqueueSnackbar} = useSnackbar();
  const deleteItem = useMutationProductsDelete();
  const {data, isLoading} = useQueryProductsList<{result: ApiProduct[]}>();
  const theme = useTheme();
  const isMobileVersion = useMediaQuery(theme.breakpoints.down('md'));

  //

  const doDeleteItem = (item: ApiProduct) => {
    if (!window.confirm(t('common:deleteConfirm', {item: item.title.en || item.title.ar}))) return;

    deleteItem.mutate(
      {id: item.productId},
      {
        onSuccess: async result => {
          result?.meta?.message &&
            enqueueSnackbar(result?.meta?.message, {
              variant: 'success',
            } as unknown as OptionsObject);
        },
        onError: err => {
          enqueueSnackbar(err?.message || 'unknown error', {
            variant: 'error',
          } as unknown as OptionsObject);
        },
      },
    );
  };

  //
  //

  return (
    <>
      <Stack alignItems="flex-end" my={2}>
        <SkeletonOnLoading isLoading={isLoading}>
          <AppButton to="/products/create" variant="contained">
            {t('common:create')}
          </AppButton>
        </SkeletonOnLoading>
      </Stack>

      {isMobileVersion ? (
        !data?.result?.length ? (
          <Stack p={3} alignItems="center" spacing={2}>
            <Typography variant="caption" fontSize="0.9rem">
              {t('common:noResults')}
            </Typography>

            <AppButton to="/products/create" variant="contained">
              {t('common:create')}
            </AppButton>
          </Stack>
        ) : (
          <Grid2 container spacing={2} justifyContent="center">
            {data?.result?.map(product => (
              <Grid2 key={product.productId}>
                <ProductItemCard product={product} doDeleteItem={doDeleteItem} />
              </Grid2>
            ))}
          </Grid2>
        )
      ) : (
        <ProductsTable
          data={data?.result || []}
          isLoading={isLoading}
          doDeleteItem={doDeleteItem}
        />
      )}
    </>
  );
}
