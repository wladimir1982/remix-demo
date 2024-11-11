import React from 'react';
import {useTranslation} from 'react-i18next';
import {formatRelative} from 'date-fns';

import {Card, CardContent, CardMedia, Typography, Button, CardHeader, Box} from '@mui/material';
import {DeleteOutline} from '@mui/icons-material';

import {AppButton} from '~/global/components/app-button';

import {ApiProduct} from '~/api-client/types';

type ProductItemCardProps = {product: ApiProduct; doDeleteItem: (item: ApiProduct) => void};

const catImg = 'https://pbs.twimg.com/profile_images/1173987553885556736/WuLwZF3C_200x200.jpg';
const foxImg =
  'https://www.memesmonkey.com/images/memesmonkey/d5/d5734a9361bfb660d6dab24265a0588a.jpeg';

const ProductItemCard: React.FC<ProductItemCardProps> = ({
  product,
  doDeleteItem,
}: ProductItemCardProps) => {
  const {t} = useTranslation(['products', 'common']);

  return (
    <Card
      sx={{
        width: 300,
        '@media (max-width: 360px)': {
          width: 270,
        },
      }}
    >
      <CardHeader
        action={
          <>
            <AppButton size="small" to={`/products/${product.productId}`} variant="contained">
              {t('common:edit')}
            </AppButton>
            <Button variant="text" onClick={() => doDeleteItem(product)}>
              <DeleteOutline />
            </Button>
          </>
        }
        title={
          <Typography
            variant="h6"
            component="div"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '145px',
            }}
          >
            {product.title.en || product.title.ar}
          </Typography>
        }
      />
      <CardMedia
        component="img"
        height="250"
        image={product.image || product.isActive ? catImg : foxImg}
        alt="Product Card"
      />
      <CardContent>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Box>
            <Box>{t('products:price')}</Box>
            <Typography variant="caption" color="textDisabled">
              {t('products:priceSale')}
            </Typography>
          </Box>
          <Box>
            <Box>${Number(product.price).toLocaleString() || '---'}</Box>
            <Typography variant="caption" color="textDisabled">
              {product?.priceSale ? '$' + Number(product.priceSale).toLocaleString() : '---'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Box>
            <Box>{t('common:createdAt')}</Box>
            <Typography variant="caption" color="textDisabled">
              {t('common:updatedAt')}
            </Typography>
          </Box>
          <Box>
            <Box>{formatRelative(new Date(product.createdAt), new Date())}</Box>
            <Typography variant="caption" color="textDisabled">
              {product.updatedAt && product.updatedAt !== product.createdAt
                ? formatRelative(new Date(product.updatedAt), new Date())
                : '---'}
            </Typography>
          </Box>
        </Box>
        {product.isActive ? (
          <Typography variant="caption" color="success">
            {t('common:active')}
          </Typography>
        ) : (
          <Box sx={{height: 20}} />
        )}
      </CardContent>
    </Card>
  );
};

export default ProductItemCard;
