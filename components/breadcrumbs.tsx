/*
 * Breadcrumbs Component with Feature Flag
 * 
 * This file exports the appropriate breadcrumbs component based on the
 * NEXT_PUBLIC_USE_NEW_DESIGN environment variable.
 */

import { Breadcrumbs as BreadcrumbsV1, type BreadcrumbItem } from './breadcrumbs-v1'
import { BreadcrumbsV2, BreadcrumbsV2Mobile, BreadcrumbsV2Schema, type BreadcrumbItemV2 } from './breadcrumbs-v2'

// Feature flag to enable gradual migration
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

// Export the appropriate component based on feature flag
export const Breadcrumbs = useNewDesign ? BreadcrumbsV2 : BreadcrumbsV1
export const BreadcrumbsMobile = useNewDesign ? BreadcrumbsV2Mobile : null
export const BreadcrumbsSchema = useNewDesign ? BreadcrumbsV2Schema : null

// Re-export types
export type { BreadcrumbItem, BreadcrumbItemV2 }