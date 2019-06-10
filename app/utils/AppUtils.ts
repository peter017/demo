import { DiffFlat } from './../domain/DiffFlat';
import numeral from 'numeral';

numeral.register('locale', 'sk', {
delimiters: {
    thousands: ' ',
    decimal: ','
},
abbreviations: {
    thousand: 'tis.',
    million: 'mil.',
    billion: 'b',
    trillion: 't'
},
ordinal: function () {
    return '.';
},
currency: {
    symbol: '€'
}
});
numeral.locale('sk');

const convertStringToNumber = (value: string): number => {
    if (typeof value === 'number') {
        return value;
    }

    var number = numeral();

    number.set(value);
    return number.value();
}

const trimTimeFromDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

const diffReportClause = (diffFlat: DiffFlat, prop: string): string => {
    const oldFlat: any = diffFlat.getOldFlat();
    const newFlat: any = diffFlat.getNewFlat();

    return `Flat property ${prop} changed from ${oldFlat[prop]} to ${newFlat[prop]} <br>`;
}

export default {
    convertStringToNumber,
    trimTimeFromDate,
    diffReportClause
}