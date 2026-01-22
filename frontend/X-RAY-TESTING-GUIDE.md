# X-Ray Analysis Feature - Testing Guide

## Overview

The X-Ray Analysis page is a doctor-only feature that allows medical professionals to upload X-ray images and receive AI-powered analysis with annotations.

## Access Requirements

- **Role**: Doctor only
- **Login**: Use `doctor@medhub.com` / `Doctor123!`
- **Location**: Bottom navigation bar → "X-Ray" tab (crosshair icon)

## Features

### 1. Role-Based Access Control

- Only users with the "Doctor" role can access this feature
- Patients and other roles will see an "Access Denied" screen with lock icon
- The X-Ray tab only appears in the navigation for doctors

### 2. Image Upload

- Click "Select X-ray Images" button to open file picker
- Supports multiple image selection
- Shows selected file names in a list
- "Clear Selection" button to reset

### 3. Analysis Process

1. Select one or more X-ray images
2. Click "Analyze X-Ray" button
3. Loading screen appears with:
   - Animated spinner
   - "Analyzing X-ray images..." message
   - "This may take a few moments" subtitle

### 4. Results Display

After analysis completes, the screen shows:

#### Statistics Card

- Number of images analyzed
- Clean, centered stat display

#### Analysis Report

- Full text report from the AI analysis
- Scrollable text area (max 400px height)
- Professional card-style formatting

#### Annotated Images

- Horizontal scrollable gallery
- Each image shows:
  - Original X-ray with AI annotations (overlays)
  - Image filename below
  - 250x250px size, properly scaled
- Base64 decoded images from backend

#### New Analysis Button

- Green button at the bottom
- Resets the form for another analysis
- Returns to upload screen

## Technical Details

### Backend Integration

- **Endpoint**: `POST /api/XRay/full-analysis`
- **Method**: FormData upload
- **Headers**: `Authorization: Bearer {token}`
- **Request**:
  ```javascript
  FormData with:
  - files: IFormFile[] (multiple X-ray images)
  - Optional: patientName, dob, age, studyDate
  ```
- **Response**:
  ```json
  {
    "success": true,
    "numFiles": 2,
    "filenames": ["xray1.jpg", "xray2.jpg"],
    "reportText": "Analysis report...",
    "overlays": ["base64string1", "base64string2"],
    "circles": [...],
    "boxes": [...]
  }
  ```

### Error Handling

- Generic error messages: "Something went wrong"
- Alert dialogs for user-facing errors
- Validates at least one image selected before analysis
- Loading state prevents double-submission

### Styling

- Matches existing app design language
- Uses Feather icons throughout
- Color scheme from `Colors.light.tint`
- Professional medical UI with cards and shadows
- Responsive scrolling for long content

## Testing Steps

1. **Login as Doctor**

   ```
   Email: doctor@medhub.com
   Password: Doctor123!
   ```

2. **Navigate to X-Ray Tab**
   - Look for "X-Ray" in bottom navigation
   - Icon: crosshair target

3. **Upload Test Images**
   - Click "Select X-ray Images"
   - Choose one or more X-ray images
   - Verify files appear in list

4. **Run Analysis**
   - Click "Analyze X-Ray"
   - Observe loading animation
   - Wait for results

5. **Review Results**
   - Check statistics card
   - Read analysis report
   - Scroll through annotated images
   - Verify all overlays loaded

6. **Start New Analysis**
   - Click "New Analysis"
   - Verify form resets
   - Upload different images

## Security Features

- JWT token authentication required
- Backend [Authorize] attribute enforces authentication
- Frontend role guard prevents unauthorized access
- Role checking happens both client and server side

## UI Components Used

- `DocumentPicker` from expo-document-picker
- `ScrollView` for scrollable content
- `ActivityIndicator` for loading state
- `Image` component for base64 display
- `Feather` icons for consistent iconography
- `TouchableOpacity` for interactive elements

## Known Limitations

- File picker limited to image types
- Maximum response size depends on backend configuration
- Requires active backend connection to MedHub X-Ray service
- Mobile file picker behavior may vary by platform

## Troubleshooting

### "Access Denied" Screen

- Verify logged in as doctor
- Check user roles in Redux state
- Confirm backend returned Doctor role

### Upload Fails

- Check backend is running
- Verify EXPO_PUBLIC_API_URL in .env
- Confirm X-Ray service container is running
- Check file format is supported

### No Results Displayed

- Check network console for API errors
- Verify backend response format matches expected structure
- Check overlays are valid base64 strings

## Development Notes

- Component: `frontend/app/(tabs)/x-ray-analysis.tsx`
- Navigation: `frontend/app/navigation-bar.tsx`
- Tab Layout: `frontend/app/(tabs)/_layout.tsx`
- Role Selector: `selectUserRoles` from authSlice
- Access Token: `selectAccessToken` from authSlice
