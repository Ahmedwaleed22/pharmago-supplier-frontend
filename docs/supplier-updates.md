# Supplier Profile Management System

## 📋 Overview

The Supplier Profile Management System provides comprehensive APIs for pharmacies to manage their complete profile information, including user account details, supplier information, and branch locations. The system supports both modern nested data formats and legacy flat formats for backward compatibility.

## 🚀 Features

- **User Profile Management**: Update name, email, phone, avatar, and password
- **Supplier Information**: Manage supplier name, description, logo, and country
- **Branch Management**: Handle multiple branch locations with full address and contact details
- **File Upload Support**: Logo and avatar uploads via BunnyCDN
- **Dual Format Support**: Both nested and legacy data formats
- **Comprehensive Validation**: Input validation for all data types
- **Security**: Role-based access control with approval requirements

## 📚 API Endpoints

### 🔍 Get Profile Information

```http
GET /api/v1/pharmacies/user
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "name": "Supplier Manager Name",
      "email": "manager@supplier.com",
      "phone_number": "+1234567890",
      "avatar": "https://cdn.example.com/avatars/avatar.jpg",
      "account_type": "supplier"
    },
    "supplier": {
      "id": "uuid",
      "name": "Main Supplier",
      "description": "Your trusted neighborhood supplier",
      "logo": "https://cdn.example.com/logos/logo.jpg",
      "country": {
        "id": "uuid",
        "name": "United Arab Emirates",
        "iso2": "AE",
        "currency": {
          "code": "AED",
          "symbol": "د.إ"
        }
      },
      "is_approved": true
    },
    "branch": {
      "id": "uuid",
      "name": "Downtown Branch",
      "address": "123 Main Street, Downtown",
      "latitude": "25.0760",
      "longitude": "55.1320",
      "phone_number": "+1234567890"
    },
    "branches": [
      {
        "id": "uuid",
        "name": "Downtown Branch",
        "address": "123 Main Street, Downtown",
        "latitude": "25.0760",
        "longitude": "55.1320",
        "phone_number": "+1234567890"
      }
    ]
  }
}
```

### ✏️ Update Profile Information

```http
POST /api/v1/pharmacies/user
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

#### Modern Nested Format (Recommended)

```json
{
  "name": "Updated Manager Name",
  "email": "updated@supplier.com",
  "phone_number": "+9876543210",
  "password": "newpassword123",
  "supplier": {
    "name": "Updated Supplier Name",
    "description": "Updated supplier description",
    "country_id": "country-uuid",
    "logo": "base64_file_or_file_upload"
  },
  "branch": {
    "name": "Updated Branch Name",
    "address": "456 New Street, Updated Location",
    "latitude": "25.1000",
    "longitude": "55.2000",
    "phone_number": "+1111111111"
  },
  "avatar": "base64_file_or_file_upload"
}
```

#### Legacy Flat Format (Backward Compatibility)

```json
{
  "name": "Updated Manager Name",
  "email": "updated@supplier.com",
  "phone_number": "+9876543210",
  "supplier_name": "Updated Supplier Name",
  "supplier_description": "Updated description",
  "country_id": "country-uuid",
  "branch_name": "Updated Branch",
  "branch_address": "Updated Address",
  "branch_latitude": "25.1000",
  "branch_longitude": "55.2000",
  "branch_phone_number": "+1111111111",
  "logo": "file_upload",
  "avatar": "file_upload"
}
```

## 🏗️ Branch Management Routes

### List All Branches
```http
GET /api/v1/pharmacies/branches
```

### Create New Branch
```http
POST /api/v1/pharmacies/branches
```

**Payload:**
```json
{
  "name": "New Branch Name",
  "address": "789 Another Street",
  "latitude": "25.2000",
  "longitude": "55.3000",
  "phone_number": "+2222222222"
}
```

### Get Specific Branch
```http
GET /api/v1/pharmacies/branches/{branch_id}
```

### Update Branch
```http
PUT /api/v1/pharmacies/branches/{branch_id}
```

**Payload:**
```json
{
  "name": "Updated Branch Name",
  "address": "Updated Address",
  "latitude": "25.2500",
  "longitude": "55.3500",
  "phone_number": "+3333333333"
}
```

### Delete Branch
```http
DELETE /api/v1/pharmacies/branches/{branch_id}
```

## 📁 File Upload Support

The system supports file uploads for:
- **Supplier Logo**: `supplier.logo` or `logo` (legacy)
- **User Avatar**: `avatar`

### File Upload Methods

1. **Multipart Form Data** (Recommended):
```javascript
const formData = new FormData();
formData.append('supplier[logo]', logoFile);
formData.append('avatar', avatarFile);
formData.append('name', 'Updated Name');
```

2. **Base64 Encoding**:
```json
{
  "supplier": {
    "logo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
  },
  "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
}
```

## 🔒 Security & Permissions

All endpoints require:
- **Authentication**: Valid Sanctum Bearer token
- **Role Authorization**: User must have `supplier` role
- **Approval Status**: Supplier must be approved (`CheckSupplierApproval` middleware)

## 📊 Data Models

### User Model
- `id` (UUID)
- `name` (string)
- `email` (string, unique)
- `phone_number` (string, unique by account type)
- `avatar` (string, URL)
- `account_type` (enum: supplier)
- `approval_status` (string)

### Supplier Model
- `id` (UUID)
- `account_id` (UUID, foreign key to users)
- `name` (string)
- `description` (text, nullable)
- `logo` (string, URL, nullable)
- `country_id` (UUID, foreign key)
- `is_approved` (boolean)

### SupplierBranch Model
- `id` (UUID)
- `supplier_id` (UUID, foreign key)
- `name` (string)
- `address` (string)
- `latitude` (decimal)
- `longitude` (decimal)
- `phone_number` (string)

## ✅ Validation Rules

### User Fields
- `name`: required|string|max:255
- `email`: required|email|unique:users,email,{user_id}
- `phone_number`: required|string|unique phone validation
- `password`: optional|string|min:8
- `avatar`: optional|image|max:2048

### Supplier Fields (Nested Format)
- `supplier.name`: required_with:supplier|string|max:255
- `supplier.description`: optional|string|max:1000
- `supplier.country_id`: optional|exists:countries,id
- `supplier.logo`: optional|image|max:5120

### Branch Fields (Nested Format)
- `branch.name`: required_with:branch|string|max:255
- `branch.address`: optional|string|max:500
- `branch.latitude`: optional|numeric|between:-90,90
- `branch.longitude`: optional|numeric|between:-180,180
- `branch.phone_number`: optional|string|max:20

### Legacy Format Validation
- All legacy fields have equivalent validation rules
- Supports backward compatibility with existing integrations

## 🔧 Implementation Details

### Controller: `UserController`
- **Location**: `app/Http/Controllers/v1/Pharmacies/Users/UserController.php`
- **Methods**: 
  - `profile()`: Get user profile with relationships
  - `updateProfile()`: Update profile with dual format support

### Request Validation: `UpdateSupplierUserProfileRequest`
- **Location**: `app/Http/Requests/v1/Pharmacies/UpdateSupplierUserProfileRequest.php`
- **Features**: Nested and legacy validation rules, custom phone validation

### Resource: `SupplierUserProfileResource`
- **Location**: `app/Http/Resources/v1/Pharmacies/SupplierUserProfileResource.php`
- **Purpose**: Transform user data with complete supplier and branch information

### Branch Controller: `BranchController`
- **Location**: `app/Http/Controllers/v1/Pharmacies/BranchController.php`
- **Features**: Full CRUD operations for supplier branches

## 🚀 Usage Examples

### JavaScript/React Example

```javascript
// Get profile
const getProfile = async () => {
  const response = await fetch('/api/v1/pharmacies/user', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Update profile with modern format
const updateProfile = async (profileData) => {
  const formData = new FormData();
  
  // Add files
  if (profileData.supplier?.logo) {
    formData.append('supplier[logo]', profileData.supplier.logo);
  }
  if (profileData.avatar) {
    formData.append('avatar', profileData.avatar);
  }
  
  // Add other data
  formData.append('name', profileData.name);
  formData.append('supplier[name]', profileData.supplier.name);
  formData.append('branch[address]', profileData.branch.address);
  
  const response = await fetch('/api/v1/pharmacies/user', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};
```

### cURL Examples

```bash
# Get profile
curl -X GET "https://api.pharmago.com/v1/pharmacies/user" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Update profile
curl -X POST "https://api.pharmago.com/v1/pharmacies/user" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Updated Name" \
  -F "supplier[name]=Updated Supplier" \
  -F "supplier[logo]=@logo.jpg" \
  -F "branch[address]=New Address"
```

## 🧪 Testing

### Test Coverage
- User profile updates (individual fields)
- Supplier data updates (nested format)
- Branch data updates (nested format)
- Legacy format compatibility
- File upload functionality
- Validation error handling
- Response structure verification

### Running Tests
```bash
# Run all supplier profile tests
php artisan test tests/Feature/Pharmacies/SupplierProfileUpdateTest.php

# Run specific test method
php artisan test --filter=supplier_can_update_user_profile_data
```

## 🔍 Troubleshooting

### Common Issues

1. **404 Route Not Found**
   - Verify route registration in `routes/v1/Supplier/api.php`
   - Check middleware requirements

2. **403 Unauthorized**
   - Ensure user has `supplier` role
   - Verify supplier approval status

3. **422 Validation Error**
   - Check validation rules in request class
   - Verify required fields are provided

4. **File Upload Issues**
   - Ensure BunnyCDN configuration is correct
   - Check file size limits and formats

### Debug Steps
1. Check route registration
2. Verify authentication token
3. Confirm user role and approval status
4. Validate request data format
5. Check server logs for detailed errors

## 📈 Performance Considerations

- **Eager Loading**: Relationships are loaded efficiently to avoid N+1 queries
- **File Storage**: Uses BunnyCDN for optimized file delivery
- **Database Indexing**: Proper indexes on foreign keys and search fields
- **Caching**: Consider implementing response caching for profile data

## 🔄 Version History

- **v1.0**: Initial implementation with basic profile management
- **v1.1**: Added dual format support (nested + legacy)
- **v1.2**: Enhanced validation and error handling
- **v1.3**: Added branch management system
- **v1.4**: Implemented comprehensive file upload system

---

## 📞 Support

For technical support or questions about the Supplier Profile Management System:
- Review this documentation
- Check the test files for usage examples
- Verify API routes and middleware configuration
- Consult the validation rules for required data formats
