export function getPrescriptionName(createdDate: string, uuid: string) {
  if (!createdDate) {
    return "Prescription Request";
  }

  const date = new Date(createdDate);
  const day = String(date.getDate()).padStart(2, '0'); // Ensure 2-digit day
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month
  const year = date.getFullYear();
  const uuidPart = uuid.slice(-4); // Use last 4 characters of the UUID

  return `PR-${year}${month}${day}-${uuidPart}`; // Format: PR-YYYYMMDD-UUID
}

export function formatPrescriptionDate(
  createdDate: string, 
  showTime: boolean = true,
  t?: (key: string) => string,
  isRtl?: boolean
) {
  if (!createdDate) return "";

  const date = new Date(createdDate);
  const day = date.getDate();
  const year = date.getFullYear();
  
  // Use translation if available, otherwise fallback to English
  const month = t 
    ? t(`common.months.${date.toLocaleString('en-US', { month: 'short' }).toLowerCase()}`)
    : date.toLocaleString('en-US', { month: 'short' });
  
  const time = showTime ? date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : "";

  // Handle RTL layout if translation context is available
  
  return `${day} ${month} ${year}`.trim();
}

export function getTranslatedTimeAgo(
  createdDate: string,
  t: (key: string) => string,
  isRtl: boolean = false
) {
  if (!createdDate) return "";

  const date = new Date(createdDate);
  const time = date.getTime();
  const now = new Date().getTime();

  const diff = now - time;
  const diffInMinutes = Math.floor(diff / (1000 * 60));

  if (diffInMinutes < 60) {
    const minuteKey = diffInMinutes === 1 ? "minute" : "minutes";
    // Handle RTL languages (Arabic) differently
    if (isRtl) {
      return `${t("common.ago")} ${diffInMinutes} ${t(
        `common.${minuteKey}`
      )}`;
    }
    return `${diffInMinutes} ${t(`common.${minuteKey}`)} ${t("common.ago")}`;
  }

  const diffInHours = Math.round(diff / (1000 * 60 * 60));
  const hourKey = diffInHours === 1 ? "hour" : "hours";

  // Handle RTL languages (Arabic) differently
  if (isRtl) {
    return `${t("common.ago")} ${diffInHours} ${t(`common.${hourKey}`)}`;
  }
  return `${diffInHours} ${t(`common.${hourKey}`)} ${t("common.ago")}`;
}

export function getTimeAgo(createdDate: string) {
  if (!createdDate) return "";

  const date = new Date(createdDate);
  const time = date.getTime();
  const now = new Date().getTime();

  const diff = now - time;
  const diffInMinutes = Math.floor(diff / (1000 * 60));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  }

  const diffInHours = Math.round(diff / (1000 * 60 * 60));

  return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
}

export function getXmlValue(str: string, key: string) {
  return str.substring(
    str.lastIndexOf('<' + key + '>') + ('<' + key + '>').length,
    str.lastIndexOf('</' + key + '>')
  );
}

export function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function isOfferExpired(createdDate: string): boolean {
  if (!createdDate) return true;
  
  const created = new Date(createdDate);
  const now = new Date();
  const diffInHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
  
  return diffInHours > 24;
}