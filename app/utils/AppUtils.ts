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

export default {
    convertStringToNumber
}