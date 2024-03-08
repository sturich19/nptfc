import {format} from 'date-fns'


export function FormatDate (date : Date)
{
    return format(date, 'MMM do');
}