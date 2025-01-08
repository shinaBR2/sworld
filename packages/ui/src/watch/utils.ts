export const formatCreatedDate = (date: string | null | undefined): string => {
  if (!date) {
    return '';
  }
  try {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date');
    }
    // Use UTC to avoid timezone shifts
    return parsedDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error);
    return '';
  }
};
