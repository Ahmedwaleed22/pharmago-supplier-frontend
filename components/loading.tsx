import React from 'react'
import { useTranslation } from '@/contexts/i18n-context'

function Loading() {
  const { t } = useTranslation();
  
  return (
    <div>{t('common.loading')}</div>
  )
}

export default Loading