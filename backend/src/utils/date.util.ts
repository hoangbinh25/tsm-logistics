export const formatVNTime = (date: Date | string | null): string => {
    if(!date) return '';
    const d = typeof date === 'string' ? new Date(date): date;

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(d)
};