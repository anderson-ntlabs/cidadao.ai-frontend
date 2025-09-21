/*
 * Button Component with Feature Flag
 * 
 * This file exports the appropriate button component based on the
 * NEXT_PUBLIC_USE_NEW_DESIGN environment variable.
 * 
 * When ready for production, we can remove the flag and use ButtonV2 directly.
 */

import { Button as ButtonV1, buttonVariants as buttonVariantsV1 } from './button-v1'
import { ButtonV2, buttonVariants as buttonVariantsV2 } from './button-v2'

// Feature flag to enable gradual migration
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

// Export the appropriate component based on feature flag
export const Button = useNewDesign ? ButtonV2 : ButtonV1
export const buttonVariants = useNewDesign ? buttonVariantsV2 : buttonVariantsV1

// Re-export types from the active version
export type { ButtonProps } from './button-v1'
export type { ButtonV2Props } from './button-v2'