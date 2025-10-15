# Supplier Profile Management System - Implementation Guide

## Overview

This implementation provides a comprehensive supplier profile management system based on the API specification from `docs/supplier-updates.md`. The system includes:

- **Modern Profile Management**: Complete user, supplier, and branch data management
- **Dual Format Support**: Both modern nested format and legacy flat format
- **File Upload Support**: Avatar and logo uploads with validation
- **Branch Management**: Full CRUD operations for supplier branches
- **Internationalization**: Full i18n support
- **Responsive Design**: Mobile-first responsive interface

## Implementation Structure

### API Endpoints

#### New Profile Management
- `GET /api/user/profile` - Get complete supplier profile
- `POST /api/user/profile` - Update supplier profile (modern nested format)

#### Branch Management
- `GET /api/branches` - List all branches
- `POST /api/branches` - Create new branch
- `GET /api/branches/[id]` - Get specific branch
- `PUT /api/branches/[id]` - Update branch
- `DELETE /api/branches/[id]` - Delete branch

#### Backward Compatibility
- `GET /api/user` - Enhanced with new endpoint fallback
- `POST /api/user` - Enhanced with new endpoint fallback

### Components

#### Main Profile Page
- **File**: `/app/dashboard/profile/page.tsx`
- **Features**: 
  - Tabbed interface (User Profile, Supplier Info, Branches)
  - Real-time form validation
  - File upload with preview
  - Modern nested data format
  - Skeleton loading states

#### Branch Manager Component
- **File**: `/components/branch-manager.tsx`
- **Features**:
  - Branch CRUD operations
  - Modal-based editing
  - Coordinate validation
  - Responsive design

### Services

#### Supplier Profile Service
- **File**: `/services/supplier-profile.ts`
- **Functions**:
  - `getSupplierProfile()` - Fetch complete profile
  - `updateSupplierProfile()` - Modern nested format update
  - `updateSupplierProfileLegacy()` - Legacy flat format support
  - Branch management functions
  - File validation utilities

### Type Definitions

#### Enhanced Auth Types
- **File**: `/types/auth.d.ts`
- **New Types**:
  - `ProfileResponse` - Complete profile data structure
  - `ProfileUpdateData` - Modern nested update format
  - `LegacyProfileUpdateData` - Legacy flat format
  - `SupplierBranch` - Branch data structure
  - `BranchCreateData` & `BranchUpdateData` - Branch operations

## Usage Examples

### Basic Profile Update (Modern Format)

```typescript
import { updateSupplierProfile } from '@/services/supplier-profile';

const profileData: Auth.ProfileUpdateData = {
  name: "John Doe",
  email: "john@supplier.com",
  supplier: {
    name: "Main Supplier",
    description: "Your trusted neighborhood supplier",
    logo: logoFile
  },
  branch: {
    name: "Downtown Branch",
    address: "123 Main St, Downtown",
    phone_number: "+1234567890"
  },
  avatar: avatarFile
};

await updateSupplierProfile(profileData);
```

### Branch Management

```typescript
import { 
  createSupplierBranch, 
  updateSupplierBranch, 
  deleteSupplierBranch 
} from '@/services/supplier-profile';

// Create new branch
const newBranch = await createSupplierBranch({
  name: "North Branch",
  address: "456 North Ave",
  latitude: "25.0760",
  longitude: "55.1320",
  phone_number: "+1234567891"
});

// Update branch
await updateSupplierBranch(branchId, {
  name: "Updated Branch Name"
});

// Delete branch
await deleteSupplierBranch(branchId);
```

### File Upload with Validation

```typescript
import { validateProfileFiles } from '@/services/supplier-profile';

const files = { logo: logoFile, avatar: avatarFile };
const errors = validateProfileFiles(files);

if (errors.length === 0) {
  // Files are valid, proceed with upload
  await updateSupplierProfile({ 
    supplier: { logo: logoFile },
    avatar: avatarFile 
  });
}
```

## Features Implemented

### ✅ Core Features
- [x] Complete profile data fetching
- [x] User profile management (name, email, phone, avatar)
- [x] Supplier information management (name, description, logo)
- [x] Main branch management (address, coordinates, phone)
- [x] Password change functionality
- [x] File upload with validation and preview
- [x] Form validation with real-time feedback

### ✅ Advanced Features
- [x] Tabbed interface for organized data entry
- [x] Branch management system with CRUD operations
- [x] Dual format support (modern nested + legacy flat)
- [x] Internationalization support
- [x] Responsive design
- [x] Loading states and error handling
- [x] Backward compatibility

### ✅ Technical Features
- [x] TypeScript type safety
- [x] API endpoint proxying
- [x] Authentication middleware
- [x] Error translation and localization
- [x] File validation utilities
- [x] Modern React patterns (hooks, state management)

## API Integration

### Backend Requirements

The frontend expects the following API endpoints to be available:

1. **Profile Endpoint**: `GET/POST /api/v1/pharmacies/user`
   - Returns complete profile data including user, supplier, branch, and branches array
   - Accepts nested format updates

2. **Branch Endpoints**: 
   - `GET /api/v1/pharmacies/branches` - List branches
   - `POST /api/v1/pharmacies/branches` - Create branch
   - `GET /api/v1/pharmacies/branches/{id}` - Get branch
   - `PUT /api/v1/pharmacies/branches/{id}` - Update branch
   - `DELETE /api/v1/pharmacies/branches/{id}` - Delete branch

### Fallback Behavior

If the new endpoints are not available, the system gracefully falls back to:
- `GET/POST /api/user` for basic profile operations
- Limited functionality but maintains backward compatibility

## Translation Keys Added

### Profile Section
- Enhanced profile translations with new fields
- Separate sections for user profile, supplier info, and branches
- Validation messages for all form fields

### Branch Management Section
- Complete branch management translations
- Form labels and validation messages
- Action confirmations and error messages

## Migration Guide

### From Old Profile System

1. **No Breaking Changes**: Existing functionality continues to work
2. **Enhanced Features**: New tabbed interface with additional fields
3. **Gradual Migration**: Backend can implement new endpoints progressively
4. **Backward Compatibility**: Falls back to old endpoints if new ones aren't available

### Update Workflow

1. Users see enhanced profile interface immediately
2. New features (branches, enhanced supplier info) become available when backend implements new endpoints
3. File uploads and basic profile updates work with both old and new backends

## Testing

### Manual Testing Checklist

#### Profile Tab
- [ ] User name update
- [ ] Email update with validation
- [ ] Phone number update
- [ ] Avatar upload and preview
- [ ] Password change
- [ ] Form validation errors
- [ ] Success messages

#### Supplier Tab
- [ ] Supplier name update
- [ ] Description update
- [ ] Logo upload and preview
- [ ] Branch information update
- [ ] Coordinate validation
- [ ] Form validation errors

#### Branches Tab
- [ ] Branch list display
- [ ] Add new branch
- [ ] Edit existing branch
- [ ] Delete branch with confirmation
- [ ] Form validation
- [ ] Coordinate validation

#### General
- [ ] Tab navigation
- [ ] Responsive design on mobile
- [ ] Loading states
- [ ] Error handling
- [ ] File validation
- [ ] Translation switching

## Performance Considerations

### Optimizations Implemented
- **Lazy Loading**: Branch management loads on tab activation
- **File Validation**: Client-side validation before upload
- **Image Previews**: Immediate preview without server roundtrip
- **Form State Management**: Efficient state updates with minimal re-renders
- **Error Boundaries**: Graceful error handling

### Best Practices
- File size limits enforced (5MB for logos, 2MB for avatars)
- Image format validation
- Coordinate range validation
- Form debouncing for validation
- Skeleton loading states for better UX

## Future Enhancements

### Planned Features
- [ ] Country selection dropdown with search
- [ ] Map integration for branch location selection
- [ ] Bulk branch import/export
- [ ] Branch operating hours management
- [ ] Branch inventory management integration
- [ ] Advanced file upload with drag & drop
- [ ] Cropping tool for images
- [ ] Branch analytics dashboard

### API Enhancements
- [ ] File upload progress tracking
- [ ] Batch operations for branches
- [ ] Advanced search and filtering
- [ ] Audit trail for profile changes
- [ ] Webhook support for profile updates

This implementation provides a solid foundation for supplier profile management while maintaining backward compatibility and supporting future enhancements.
