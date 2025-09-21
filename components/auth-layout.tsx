/*
 * AuthLayout Component with Feature Flag
 * 
 * This file exports the appropriate auth layout component based on the
 * NEXT_PUBLIC_USE_NEW_DESIGN environment variable.
 */

import { AuthLayout as AuthLayoutV1 } from './auth-layout-v1'
import { AuthLayoutV2, AuthLayoutV2WithSidebar } from './auth-layout-v2'

// Feature flag to enable gradual migration
const useNewDesign = process.env.NEXT_PUBLIC_USE_NEW_DESIGN === 'true'

// Export the appropriate component based on feature flag
export const AuthLayout = useNewDesign ? AuthLayoutV2 : AuthLayoutV1
export const AuthLayoutWithSidebar = useNewDesign ? AuthLayoutV2WithSidebar : AuthLayoutV1