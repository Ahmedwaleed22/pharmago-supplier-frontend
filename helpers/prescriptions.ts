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

export function formatPrescriptionDate(createdDate: string, showTime: boolean = true) {
  if (!createdDate) return "";

  const date = new Date(createdDate);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const time = showTime ? date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) : "";

  return `${day} ${month} ${year} ${time}`;
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