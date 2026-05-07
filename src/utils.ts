export function isToday(dateString: string) {
  const target = new Date(dateString);

  const now = new Date();

  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  );
}

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString(
    "ja-JP",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

export function getRelativeTime(
  dateString: string
) {
  const diff =
    Date.now() - new Date(dateString).getTime();

  const minutes = Math.floor(diff / 1000 / 60);

  if (minutes < 60) {
    return `${minutes}分前`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}時間前`;
  }

  const days = Math.floor(hours / 24);

  return `${days}日前`;
}