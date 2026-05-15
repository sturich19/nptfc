export function GetClosestSaturday (date : Date)
{
    if (date.getDay() === 6)
        return date;

    const dayOfWeek = date.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7; // If today is Saturday, set to next Saturday
    const nextSaturdayDate = new Date(date);
    nextSaturdayDate.setDate(date.getDate() + daysUntilSaturday);    

    return nextSaturdayDate;
}