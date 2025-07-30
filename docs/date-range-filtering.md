# Date Range Filtering for Sales Dashboard

## Overview

The sales dashboard now supports custom date range filtering, allowing users to view statistics for specific time periods. This feature enhances the analytics capabilities by providing more granular control over the data being displayed.

## Features

### Date Range Picker Component

- **Custom Date Selection**: Users can select specific "from" and "to" dates
- **Quick Selection Buttons**: Predefined ranges for common periods:
  - Last 7 days
  - Last 30 days  
  - Last 90 days
- **Apply/Clear Actions**: Easy to apply filters or clear them
- **Internationalization**: Supports all project languages (English, Arabic, Spanish, French)

### Backend API Support

The backend API has been enhanced to support custom date ranges:

#### New Parameters
- `from_date`: Start date in YYYY-MM-DD format
- `to_date`: End date in YYYY-MM-DD format

#### Backward Compatibility
- The existing `period` parameter (week, month, year) still works
- If no custom dates are provided, the system falls back to period-based filtering

#### API Response Enhancement
The API now includes a `date_range` object in the response:
```json
{
  "period": "custom",
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "previous_start_date": "2023-12-01",
    "previous_end_date": "2023-12-31"
  },
  // ... rest of the response
}
```

## Implementation Details

### Frontend Changes

1. **New Component**: `DateRangePicker` in `components/ui/date-range-picker.tsx`
2. **Updated Query Options**: `createDashboardSalesQueryOptions` now accepts date parameters
3. **Updated Service**: `getDashboardSales` function supports date range parameters
4. **Updated API Route**: Frontend API route forwards date parameters to backend
5. **Updated Sales Page**: Integrated date picker with state management

### Backend Changes

1. **SalesController**: Modified `getSales` method to handle custom date ranges
2. **Date Range Logic**: Calculates previous period of same duration for trend comparison
3. **Response Enhancement**: Added date range information to API response

### Translation Support

Added translations for all supported languages:
- English: `dashboard.dateRange.*`
- Arabic: `dashboard.dateRange.*`
- Spanish: `dashboard.dateRange.*`
- French: `dashboard.dateRange.*`

## Usage

### For Users

1. Navigate to the Sales Dashboard
2. Use the date range picker at the top of the page
3. Select custom dates or use quick selection buttons
4. Click "Apply Filter" to update the statistics
5. Use "Clear" to reset the filter

### For Developers

#### Adding Date Range to Other Components

```typescript
import { DateRangePicker } from "@/components/ui/date-range-picker";

function MyComponent() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleDateChange = (newFromDate: string, newToDate: string) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  return (
    <DateRangePicker
      fromDate={fromDate}
      toDate={toDate}
      onDateChange={handleDateChange}
    />
  );
}
```

#### API Integration

```typescript
const { data } = useQuery({
  queryKey: ['dashboardSales', fromDate, toDate],
  queryFn: () => getDashboardSales(fromDate, toDate),
});
```

## Technical Notes

- Date parameters are optional and maintain backward compatibility
- Previous period calculation ensures meaningful trend comparisons
- All date handling uses ISO format (YYYY-MM-DD)
- Timezone handling is consistent across the application
- Query caching includes date parameters for proper invalidation

## Future Enhancements

- Add more predefined date ranges (last quarter, last year, etc.)
- Support for relative date ranges (last N days from today)
- Export functionality with date range filtering
- Comparative analysis between different date ranges 