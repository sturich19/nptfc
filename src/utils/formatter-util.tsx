import {format} from 'date-fns'


export function FormatDate (date : Date)
{
    return format(date, 'MMM do');
}

export function FormatDateYYYYMMDD (date : Date)
{
    const year = date.getFullYear();
    // Add 1 to the month since getMonth() returns 0-11
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Ensures two digits
    const day = (`0${date.getDate()}`).slice(-2); // Ensures two digits
    return `${year}-${month}-${day}`;
}