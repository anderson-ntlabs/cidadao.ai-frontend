/*
 * Card Component with Feature Flag
 * 
 * This file exports the appropriate card component based on the
 * NEXT_PUBLIC_USE_NEW_DESIGN environment variable.
 */

import { 
  Card as CardV1, 
  CardHeader as CardHeaderV1,
  CardFooter as CardFooterV1,
  CardTitle as CardTitleV1,
  CardDescription as CardDescriptionV1,
  CardContent as CardContentV1,
  cardVariants as cardVariantsV1
} from './card-v1'

import { 
  CardV2, 
  CardV2Header,
  CardV2Footer,
  CardV2Title,
  CardV2Description,
  CardV2Content,
  CardV2Badge,
  CardV2Stat,
  cardVariants as cardVariantsV2
} from './card-v2'

// Feature flag to enable gradual migration
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

// Export the appropriate components based on feature flag
export const Card = useNewDesign ? CardV2 : CardV1
export const CardHeader = useNewDesign ? CardV2Header : CardHeaderV1
export const CardFooter = useNewDesign ? CardV2Footer : CardFooterV1
export const CardTitle = useNewDesign ? CardV2Title : CardTitleV1
export const CardDescription = useNewDesign ? CardV2Description : CardDescriptionV1
export const CardContent = useNewDesign ? CardV2Content : CardContentV1
export const cardVariants = useNewDesign ? cardVariantsV2 : cardVariantsV1

// New components only available in v2
export const CardBadge = useNewDesign ? CardV2Badge : null
export const CardStat = useNewDesign ? CardV2Stat : null